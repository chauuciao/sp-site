import { NextResponse } from "next/server";
import { adminAuth, firebaseConfigured } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/session";

/**
 * DEV ONLY: mints a session for the first allowlisted owner so the editing
 * flow can be exercised locally without a password. Refuses to exist in
 * production builds.
 */
export async function POST() {
  if (process.env.NODE_ENV !== "development" || !firebaseConfigured()) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const owner = (process.env.OWNER_EMAIL ?? "").split(",")[0]?.trim();
  if (!owner) return NextResponse.json({ error: "no owner" }, { status: 500 });

  const user = await adminAuth().getUserByEmail(owner);
  const customToken = await adminAuth().createCustomToken(user.uid);

  // custom token → idToken via the public Identity Toolkit endpoint
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const { idToken } = (await res.json()) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "exchange failed" }, { status: 500 });

  const cookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });
  const out = NextResponse.json({ ok: true, as: owner });
  out.cookies.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
  return out;
}
