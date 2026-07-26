import "server-only";

import { cookies } from "next/headers";
import { adminAuth, firebaseConfigured } from "./firebase/admin";

export const SESSION_COOKIE = "__session";
/** Firebase caps session cookies at 14 days. */
export const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

export interface OwnerSession {
  uid: string;
  email: string;
}

/**
 * Verifies the session cookie and that it belongs to the owner.
 * Returns null for visitors — this is the draft-vs-published switch.
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  if (!firebaseConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    if (!isOwnerEmail(decoded.email)) return null;
    return { uid: decoded.uid, email: decoded.email! };
  } catch {
    return null;
  }
}

/** The hard boundary — every mutating server action calls this first. */
export async function requireOwner(): Promise<OwnerSession> {
  const session = await getOwnerSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export function isOwnerEmail(email: string | undefined): boolean {
  const owner = process.env.OWNER_EMAIL;
  return Boolean(owner && email && email.toLowerCase() === owner.toLowerCase());
}
