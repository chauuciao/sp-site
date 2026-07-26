/**
 * One-shot Firestore seed from the M1 fixtures.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed.ts
 *
 * Idempotent — documents are keyed by slug/index and overwritten on re-run.
 * (Node 24 runs TypeScript natively via type stripping.)
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { journeys, settings, writings } from "../src/content/fixtures.ts";

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

async function main() {
  const batch = db.batch();

  batch.set(db.doc("settings/singleton"), settings);

  for (const w of writings) {
    batch.set(db.doc(`reviews/${w.slug}`), w);
  }

  journeys.forEach((j, i) => {
    batch.set(db.doc(`journeys/journey-${i}`), { ...j, sortOrder: i });
  });

  await batch.commit();
  console.log(
    `Seeded: settings, ${writings.length} reviews, ${journeys.length} journeys.`,
  );
}

main().then(() => process.exit(0));
