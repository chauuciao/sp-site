import Link from "next/link";
import type { SettingsDoc } from "@/lib/data";

export function Header({ settings }: { settings: SettingsDoc }) {
  return (
    <header className="flex items-start justify-between gap-4 p-6 text-[14px] font-medium leading-[14px] sm:gap-6 sm:text-[16px]">
      <Link href="/" className="whitespace-nowrap">
        {settings.wordmark}
      </Link>
      <nav className="flex items-center gap-4 sm:gap-[23px]">
        {settings.nav.map((item) => (
          <a key={item.label} href={item.href} className="whitespace-nowrap hover:opacity-60">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
