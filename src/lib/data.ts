import "server-only";

import {
  journeys as fixtureJourneys,
  settings as fixtureSettings,
  writings as fixtureWritings,
  type JourneyFixture,
  type WritingFixture,
} from "@/content/fixtures";
import { adminDb, firebaseConfigured } from "./firebase/admin";

/**
 * Content data layer. All reads come through here so pages don't know
 * whether Firestore is wired up yet — before the Firebase project exists
 * (or in a preview without env vars) we serve the fixtures, so the site
 * always builds and deploys.
 *
 * Firestore layout:
 *   reviews/{slug}        — WritingDoc (the working draft)
 *   journeys/{id}         — JourneyDoc
 *   settings/singleton    — SettingsDoc
 *   subscribers/{email}   — added in M9
 *   */

export type SettingsDoc = typeof fixtureSettings;
export type WritingDoc = WritingFixture & {
  /** Firestore doc id — needed to save edits */
  docId?: string;
  /** Verbatim Goodreads review HTML (imported); superseded by bodyJson once edited */
  reviewHtml?: string | null;
  /** JSON.stringify'd BlockNote blocks (authoritative body once present) */
  bodyJson?: string | null;
};
export type JourneyDoc = JourneyFixture & { id: string };

export interface HomePageData {
  settings: SettingsDoc;
  writings: WritingDoc[];
  journeys: JourneyDoc[];
  /** True when content came from Firestore rather than fixtures. */
  live: boolean;
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!firebaseConfigured()) {
    return {
      settings: fixtureSettings,
      writings: fixtureWritings,
      journeys: fixtureJourneys.map((j, i) => ({ ...j, id: String(i) })),
      live: false,
    };
  }

  const db = adminDb();
  const [settingsSnap, writingsSnap, journeysSnap] = await Promise.all([
    db.doc("settings/singleton").get(),
    db.collection("reviews").orderBy("date", "desc").limit(100).get(),
    db.collection("journeys").orderBy("sortOrder", "asc").get(),
  ]);

  return {
    settings: (settingsSnap.data() as SettingsDoc | undefined) ?? fixtureSettings,
    writings: writingsSnap.docs.map((d) => d.data() as WritingDoc),
    journeys: journeysSnap.docs.map((d) => ({ ...(d.data() as JourneyFixture), id: d.id })),
    live: true,
  };
}

export async function getReviewBySlug(slug: string): Promise<WritingDoc | null> {
  if (!firebaseConfigured()) {
    return fixtureWritings.find((w) => w.slug === slug) ?? null;
  }
  const snap = await adminDb()
    .collection("reviews")
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { ...(snap.docs[0].data() as WritingDoc), docId: snap.docs[0].id };
}
