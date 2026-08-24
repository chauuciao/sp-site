import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { isOwnerEmail, SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/session";

/**
 * Exchanges a Firebase ID token (from the client email-link sign-in) for an
 * httpOnly session cookie the server can verify in RSCs and server actions.
 *
 * Anyone can complete Firebase's email-link flow, but only the owner's email
 * is ever minted a session — this check is the actual gate.
 */
export async function POST(req: NextRequest) {
  const { idToken } = (await req.json().catch(() => ({}))) as {
    idToken?: string;
  };
  if (!idToken) {
    return NextResponse.json({ error: "missing idToken" }, { status: 400 });
  }

  const decoded = await adminAuth()
    .verifyIdToken(idToken)
    .catch(() => null);
  if (!decoded || !isOwnerEmail(decoded.email)) {
    return NextResponse.json({ error: "not authorized" }, { status: 403 });
  }

  const cookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
