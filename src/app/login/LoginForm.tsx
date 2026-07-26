"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientAuth } from "@/lib/firebase/client";

const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

/**
 * Email + password sign-in. The Firebase credential is exchanged at
 * /api/session for an httpOnly session cookie; only OWNER_EMAIL is minted
 * one, so a stray Firebase user gains nothing.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(clientAuth(), email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("not authorized");
      router.replace("/");
      router.refresh();
    } catch {
      setError("That didn’t work — check the email and password.");
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-[16px] leading-[27px] text-black/60">
        Sign-in isn’t set up yet — the Firebase project hasn’t been connected.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-[420px] flex-col gap-4">
      <label htmlFor="login-email" className="font-mono text-[12px] text-black/80">
        Email
      </label>
      <div className="flex h-16 items-center bg-[#f9f9f9] px-4">
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-black/40"
        />
      </div>
      <label htmlFor="login-password" className="font-mono text-[12px] text-black/80">
        Password
      </label>
      <div className="flex h-16 items-center bg-[#f9f9f9] px-4">
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent text-[16px] outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="h-12 cursor-pointer bg-ink text-[14px] uppercase tracking-[1px] text-white hover:opacity-80 disabled:opacity-40"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="text-[14px] text-red-700">{error}</p>}
    </form>
  );
}
