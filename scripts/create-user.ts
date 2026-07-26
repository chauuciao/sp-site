/**
 * Creates (or resets the password of) the owner's Firebase Auth user.
 * Run it yourself so the password never leaves your terminal:
 *
 *   node --env-file=.env.local scripts/create-user.ts you@example.com 'your-password'
 *
 * Requires the Email/Password provider to be enabled in the Firebase console.
 */
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/create-user.ts <email> <password>");
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

const auth = getAuth(app);

async function main() {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password });
    console.log(`Password updated for ${email}`);
  } catch {
    await auth.createUser({ email, password, emailVerified: true });
    console.log(`User created: ${email}`);
  }
}

main().then(() => process.exit(0));
