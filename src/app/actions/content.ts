"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { requireOwner } from "@/lib/session";

export interface SaveReviewPatch {
  subjectTitle?: string;
  creator?: string;
  blurb?: string | null;
  /** JSON.stringify'd BlockNote blocks (string keeps Firestore happy re nested arrays) */
  bodyJson?: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveReview(
  docId: string,
  patch: SaveReviewPatch,
): Promise<{ ok: true; updatedAt: string; slug?: string }> {
  await requireOwner();
  const db = adminDb();
  const ref = db.doc(`reviews/${docId}`);

  // whitelist fields — never write client-supplied keys blindly
  const clean: Record<string, unknown> = {};
  if (typeof patch.subjectTitle === "string") clean.subjectTitle = patch.subjectTitle.trim();
  if (typeof patch.creator === "string") clean.creator = patch.creator.trim();
  if (typeof patch.blurb === "string" || patch.blurb === null) clean.blurb = patch.blurb;
  if (typeof patch.bodyJson === "string") clean.bodyJson = patch.bodyJson;

  const updatedAt = new Date().toISOString();
  clean.updatedAt = updatedAt;

  // "untitled-…" drafts get a real slug once they have a real title
  let newSlug: string | undefined;
  if (typeof patch.subjectTitle === "string" && patch.subjectTitle.trim()) {
    const current = (await ref.get()).data();
    if (current?.slug?.startsWith("untitled-")) {
      const candidate = slugify(patch.subjectTitle);
      if (candidate.length >= 3) {
        const clash = await db
          .collection("reviews")
          .where("slug", "==", candidate)
          .limit(1)
          .get();
        newSlug = clash.empty ? candidate : `${candidate}-${docId.slice(-4)}`;
        clean.slug = newSlug;
      }
    }
  }

  await ref.set(clean, { merge: true });
  revalidatePath("/");
  return { ok: true, updatedAt, slug: newSlug };
}

export async function setReviewStatus(
  docId: string,
  status: "draft" | "published",
): Promise<{ ok: true }> {
  await requireOwner();
  await adminDb()
    .doc(`reviews/${docId}`)
    .set({ status, updatedAt: new Date().toISOString() }, { merge: true });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteReview(docId: string): Promise<{ ok: true }> {
  await requireOwner();
  await adminDb().doc(`reviews/${docId}`).delete();
  revalidatePath("/");
  return { ok: true };
}

export async function createReview(): Promise<never> {
  await requireOwner();

  const slug = `untitled-${Date.now().toString(36)}`;
  await adminDb()
    .collection("reviews")
    .doc(slug)
    .set({
      slug,
      kind: "book",
      status: "draft",
      subjectTitle: "Untitled",
      creator: "",
      date: new Date().toISOString().slice(0, 10),
      rating: null,
      thumbnail: "/images/cover-bend-sinister.png",
      blurb: null,
      reviewHtml: null,
      bodyJson: null,
      createdAt: new Date().toISOString(),
    });

  redirect(`/writings/${slug}`);
}
