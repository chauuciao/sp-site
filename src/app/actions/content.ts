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

export async function saveReview(
  docId: string,
  patch: SaveReviewPatch,
): Promise<{ ok: true; updatedAt: string }> {
  await requireOwner();

  // whitelist fields — never write client-supplied keys blindly
  const clean: Record<string, unknown> = {};
  if (typeof patch.subjectTitle === "string") clean.subjectTitle = patch.subjectTitle.trim();
  if (typeof patch.creator === "string") clean.creator = patch.creator.trim();
  if (typeof patch.blurb === "string" || patch.blurb === null) clean.blurb = patch.blurb;
  if (typeof patch.bodyJson === "string") clean.bodyJson = patch.bodyJson;

  const updatedAt = new Date().toISOString();
  clean.updatedAt = updatedAt;

  await adminDb().doc(`reviews/${docId}`).set(clean, { merge: true });
  revalidatePath("/");
  return { ok: true, updatedAt };
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
