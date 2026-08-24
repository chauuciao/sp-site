import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Shrikant Pandey",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col px-6 py-6">
      <Link href="/" className="text-[16px] font-medium">
        Shrikant Pandey
      </Link>
      <div className="flex grow flex-col items-center justify-center gap-8">
        <h1 className="text-[28px] tracking-[-0.17px]">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
