import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Server-side Firebase. The admin SDK bypasses security rules, which are
 * deny-all for clients — every read/write in this app goes through here,
 * from server actions and RSCs only. The browser SDK is used solely for
 * the email-link sign-in flow.
 */

export function firebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

let app: App | undefined;

function getApp(): App {
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          // Vercel env vars store newlines escaped
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
  }
  return app;
}

export const adminDb = () => getFirestore(getApp());
export const adminAuth = () => getAuth(getApp());
export const adminBucket = () => getStorage(getApp()).bucket();
