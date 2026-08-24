import Link from "next/link";
import { createReview } from "@/app/actions/content";
import type { SettingsDoc } from "@/lib/data";
import { CopyEmail } from "./CopyEmail";

export function Header({
  settings,
  canEdit = false,
}: {
  settings: SettingsDoc;
  canEdit?: boolean;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-6 text-[14px] font-medium leading-[14px] sm:gap-x-6 sm:text-[16px]">
      <Link href="/" className="whitespace-nowrap">
        {settings.wordmark}
      </Link>
      <nav className="flex items-center gap-4 sm:gap-[23px]">
        {canEdit && (
          <form action={createReview}>
            <button
              type="submit"
              className="cursor-pointer whitespace-nowrap font-medium underline underline-offset-4 hover:opacity-60"
            >
              New Review
            </button>
          </form>
        )}
        {settings.nav.map((item) =>
          item.href === "#copy-email" ? (
            <CopyEmail
              key={item.label}
              email={settings.contactEmail}
              label={item.label}
            />
          ) : (
            <a key={item.label} href={item.href} className="whitespace-nowrap hover:opacity-60">
              {item.label}
            </a>
          ),
        )}
      </nav>
    </header>
  );
}
