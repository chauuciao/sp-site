"use client";

import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clientAuth } from "@/lib/firebase/client";

const EMAIL_KEY = "sp:login-email";

type Phase = "idle" | "sending" | "sent" | "completing" | "error";

/**
 * Email-link login. One field, no password, no signup.
 * The same page completes the flow when opened from the emailed link.
 */
const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  // Completing a sign-in link? (User clicked the email.)
  useEffect(() => {
    if (!configured) return;
    const auth = clientAuth();
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const stored =
      window.localStorage.getItem(EMAIL_KEY) ??
      window.prompt("Confirm your email address") ??
      "";
    if (!stored) return;

    setPhase("completing");
    (async () => {
      try {
        const cred = await signInWithEmailLink(auth, stored, window.location.href);
        const idToken = await cred.user.getIdToken();
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        if (!res.ok) throw new Error("not authorized");
        window.localStorage.removeItem(EMAIL_KEY);
        router.replace("/");
        router.refresh();
      } catch {
        setPhase("error");
        setMessage("That link didn’t work. Try sending a fresh one.");
      }
    })();
  }, [router]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setPhase("sending");
    try {
      await sendSignInLinkToEmail(clientAuth(), email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_KEY, email);
      setPhase("sent");
    } catch {
      setPhase("error");
      setMessage("Couldn’t send the link. Check the address and try again.");
    }
  }

  if (!configured) {
    return (
      <p className="text-[16px] leading-[27px] text-black/60">
        Sign-in isn’t set up yet — the Firebase project hasn’t been connected.
      </p>
    );
  }

  if (phase === "completing") {
    return <p className="text-[16px]">Signing you in…</p>;
  }

  if (phase === "sent") {
    return (
      <p className="text-[16px] leading-[27px]">
        Check your inbox — we’ve sent a sign-in link to{" "}
        <strong>{email}</strong>. You can close this tab.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="flex w-full max-w-[420px] flex-col gap-4">
      <label htmlFor="login-email" className="font-mono text-[12px] text-black/80">
        Your email address
      </label>
      <div className="flex h-16 items-center justify-between bg-[#f9f9f9] px-4">
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-black/40"
        />
      </div>
      <button
        type="submit"
        disabled={phase === "sending"}
        className="h-12 bg-ink text-[14px] uppercase tracking-[1px] text-white hover:opacity-80 disabled:opacity-40"
      >
        {phase === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {phase === "error" && (
        <p className="text-[14px] text-red-700">{message}</p>
      )}
    </form>
  );
}
