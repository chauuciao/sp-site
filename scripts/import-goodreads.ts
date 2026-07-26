/**
 * Goodreads → Firestore importer.
 *
 * Parses the public RSS feed of his "read" shelf verbatim (no summarisation),
 * downloads full-size covers into public/images/covers/, and upserts one
 * Firestore doc per book. Existing kind=="book" docs are replaced wholesale;
 * film docs are left alone. Idempotent — docs are keyed by Goodreads book id.
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-goodreads.ts
 *
 * Covers land in public/ for now; they move to Firebase Storage when the M4
 * upload pipeline exists.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const FEED = "https://www.goodreads.com/review/list_rss/36896623?shelf=read";
const COVER_DIR = new URL("../public/images/covers/", import.meta.url).pathname;

const app =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
const db = getFirestore(app);

// ---------- tiny RSS field helpers (fields are flat inside <item>) ----------

function field(item: string, tag: string): string {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function slugify(title: string, fallback: string): string {
  const s = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.length >= 3 ? s : `book-${fallback}`;
}

function toIso(rssDate: string): string | null {
  const d = new Date(rssDate);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function downloadCover(url: string, bookId: string): Promise<string | null> {
  // strip Goodreads size suffix (._SY475_ etc.) for the original file
  const full = url.replace(/\._S[XY]\d+_(?=\.jpg)/i, "");
  for (const candidate of [full, url]) {
    const res = await fetch(candidate);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 1000) {
        writeFileSync(`${COVER_DIR}${bookId}.jpg`, buf);
        return `/images/covers/${bookId}.jpg`;
      }
    }
  }
  return null;
}

// ---------------------------------- main -----------------------------------

async function main() {
  mkdirSync(COVER_DIR, { recursive: true });

  const xml = await (await fetch(FEED)).text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  console.log(`Feed items: ${items.length}`);

  type BookDoc = Record<string, unknown> & { date: string; rating: number };
  const docs: { id: string; doc: BookDoc }[] = [];

  for (const item of items) {
    const bookId = field(item, "book_id");
    const title = field(item, "title");
    const reviewHtml = field(item, "user_review");
    const cover = await downloadCover(field(item, "book_large_image_url"), bookId);
    const reviewText = htmlToText(reviewHtml);
    const date =
      toIso(field(item, "user_read_at")) ??
      toIso(field(item, "user_date_added")) ??
      "1970-01-01";

    docs.push({
      id: bookId,
      doc: {
        slug: slugify(title, bookId),
        kind: "book",
        subjectTitle: title,
        creator: field(item, "author_name"),
        date,
        rating: Number(field(item, "user_rating")) || null,
        thumbnail: cover ?? "/images/cover-bend-sinister.png",
        blurb: reviewText ? reviewText.slice(0, 260) : null,
        reviewHtml: reviewHtml || null,
        source: {
          provider: "goodreads",
          bookId,
          reviewUrl: htmlToText(field(item, "link")),
          isbn: field(item, "isbn") || null,
          pages: Number(field(item, "num_pages")) || null,
          importedAt: new Date().toISOString(),
        },
      },
    });
  }

  // featured = most recently read 5★ with an actual review
  const featured = docs
    .filter((d) => d.doc.rating === 5 && d.doc.reviewHtml)
    .sort((a, b) => (a.doc.date < b.doc.date ? 1 : -1))[0];
  if (featured) featured.doc.featured = true;

  // replace existing book docs (films untouched)
  const existing = await db.collection("reviews").where("kind", "==", "book").get();
  const batch = db.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));
  docs.forEach(({ id, doc }) => batch.set(db.doc(`reviews/${id}`), doc));
  await batch.commit();

  const withReviews = docs.filter((d) => d.doc.reviewHtml).length;
  console.log(
    `Imported ${docs.length} books (${withReviews} with review text). Featured: ${
      featured ? (featured.doc.subjectTitle as string) : "none"
    }`,
  );
}

main().then(() => process.exit(0));
