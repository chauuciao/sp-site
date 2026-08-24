/**
 * One-shot import of posts his father emailed (text captured verbatim to
 * scratchpad files by the session that read the inbox).
 *
 *   node --env-file=.env.local scripts/import-emails.ts <dir-with-email-*.txt>
 *
 * - email files: header lines (TITLE/CREATOR/KIND/RATING/DATE/EXISTING_DOC),
 *   blank line, then the verbatim body
 * - body → simple <p>/<blockquote> HTML into reviewHtml (first Edit in the
 *   UI converts to BlockNote blocks, same as the Goodreads imports)
 * - covers: OpenLibrary for books; the named public-domain paintings for
 *   the musings; a neutral tile otherwise (replaceable in the UI later)
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import sharp from "sharp";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node --env-file=.env.local scripts/import-emails.ts <dir>");
  process.exit(1);
}

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

const COVER_DIR = new URL("../public/images/covers/", import.meta.url).pathname;

/** cover overrides: slug → public-domain image URL named in the email */
const NAMED_IMAGES: Record<string, string> = {
  "musing-1-belonging-over-belief":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Pieter_Bruegel_the_Elder_%281568%29_The_Blind_Leading_the_Blind.jpg/960px-Pieter_Bruegel_the_Elder_%281568%29_The_Blind_Leading_the_Blind.jpg",
  "musing-2-crudeness-is-not-confidence":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/960px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(body: string): string {
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paras
    .map((p) => {
      if (p.startsWith("## ")) return `<h2>${esc(p.slice(3))}</h2>`;
      const oneLine = esc(p)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
      // epigraphs: quote + attribution ("— X" / "~ X") become blockquotes
      if (/^[“"]/.test(p) && /(\n|^)\s*[—~]/.test(p)) {
        return `<blockquote>${oneLine}</blockquote>`;
      }
      return `<p>${oneLine}</p>`;
    })
    .join("\n");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function fetchImage(url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "sp-site-importer/1.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) return null;
    const out = await sharp(buf).resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    writeFileSync(join(COVER_DIR, `${slug}.jpg`), out);
    return `/images/covers/${slug}.jpg`;
  } catch {
    return null;
  }
}

async function openLibraryCover(title: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5`,
      { headers: { "User-Agent": "sp-site-importer/1.0" } },
    );
    const data = (await res.json()) as { docs?: { cover_i?: number }[] };
    const cover = data.docs?.find((d) => d.cover_i)?.cover_i;
    if (!cover) return null;
    return await fetchImage(`https://covers.openlibrary.org/b/id/${cover}-L.jpg`, slug);
  } catch {
    return null;
  }
}

async function neutralTile(): Promise<string> {
  const path = join(COVER_DIR, "neutral.png");
  const buf = await sharp({
    create: { width: 310, height: 475, channels: 3, background: "#e8e6e1" },
  })
    .png()
    .toBuffer();
  writeFileSync(path, buf);
  return "/images/covers/neutral.png";
}

interface Parsed {
  title: string;
  creator: string;
  kind: string;
  rating: number | null;
  date: string;
  existingDoc: string | null;
  body: string;
}

function parse(file: string): Parsed {
  const raw = readFileSync(file, "utf8");
  const lines = raw.split("\n");
  const header: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^([A-Z_-]+):\s*(.*)$/);
    if (!m) break;
    header[m[1]] = m[2];
  }
  return {
    title: header.TITLE ?? "Untitled",
    creator: header.CREATOR ?? "",
    kind: header.KIND ?? "blog",
    rating: header.RATING ? Number(header.RATING) : null,
    date: header.DATE ?? new Date().toISOString().slice(0, 10),
    existingDoc: header.EXISTING_DOC ?? null,
    body: lines.slice(i).join("\n").trim(),
  };
}

async function main() {
  const neutral = await neutralTile();
  const files = readdirSync(dir).filter((f) => f.startsWith("email-") && f.endsWith(".txt"));
  console.log(`Importing ${files.length} emailed posts…`);

  for (const f of files) {
    const p = parse(join(dir, f));
    const baseSlug =
      p.kind === "blog" && /^MUSING/i.test(p.title)
        ? slugify(p.title.replace(/^MUSING\s*[–-]\s*(\d+):?/i, "musing-$1 "))
        : slugify(p.title);

    let thumbnail =
      NAMED_IMAGES[baseSlug] !== undefined
        ? await fetchImage(NAMED_IMAGES[baseSlug], baseSlug)
        : p.kind === "book"
          ? await openLibraryCover(p.title, baseSlug)
          : null;
    thumbnail ??= neutral;

    const reviewHtml = toHtml(p.body);
    const blurb = p.body
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .find((x) => x.length > 80)
      ?.replace(/\n/g, " ")
      .slice(0, 260) ?? null;

    const doc = {
      slug: baseSlug,
      kind: p.kind,
      status: "published",
      subjectTitle: p.title,
      creator: p.creator,
      date: p.date,
      rating: p.rating,
      thumbnail,
      blurb,
      reviewHtml,
      source: { provider: "email", file: f, importedAt: new Date().toISOString() },
    };

    if (p.existingDoc) {
      await db.doc(`reviews/${p.existingDoc}`).set(doc, { merge: true });
      console.log(`updated ${p.existingDoc} -> ${baseSlug} (${p.kind})`);
    } else {
      await db.doc(`reviews/${baseSlug}`).set(doc, { merge: true });
      console.log(`created ${baseSlug} (${p.kind})${thumbnail === neutral ? " [neutral tile]" : ""}`);
    }
  }
}

main().then(() => process.exit(0));
