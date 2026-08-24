"use client";

import { useRef, useState } from "react";

/** Nav item that copies the contact email, with brief "Copied!" feedback. */
export function CopyEmail({ email, label }: { email: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard API can be unavailable (http, permissions) — fall back
      window.prompt("Copy the email address:", email);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="cursor-pointer whitespace-nowrap hover:opacity-60"
      aria-live="polite"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
