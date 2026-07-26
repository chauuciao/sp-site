import Image from "next/image";
import { formatDate } from "@/content/fixtures";
import type { SettingsDoc, WritingDoc } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { SubjectTitle } from "./SubjectTitle";

/**
 * Footer: white card (portrait + two recent entries + "Read all issues")
 * beside the newsletter block. Responsive decision: newsletter first below
 * `page` — it's the call to action; the portrait card is garnish.
 */
export function Footer({
  settings,
  writings,
}: {
  settings: SettingsDoc;
  writings: WritingDoc[];
}) {
  const recent = writings.slice(0, 2);

  return (
    <footer id="newsletter" className="bg-ink/5 px-6 py-12">
      <div className="flex flex-col gap-12 page:grid page:grid-cols-16 page:gap-x-[10px]">
        <div className="order-2 bg-white p-6 page:order-none page:col-[1/span_5]">
          <div className="relative aspect-square w-full max-w-[473px]">
            <Image
              src={settings.portrait}
              alt="Shrikant Pandey"
              fill
              sizes="473px"
              className="object-cover"
            />
          </div>
          <ul className="pt-8">
            {recent.map((w) => (
              <li key={w.slug} className="border-b border-line py-[15px]">
                <a href={`/writings/${w.slug}`} className="flex flex-col gap-2 hover:opacity-60">
                  <h3 className="font-serif text-[22px] leading-[1.15] tracking-[-0.78px] sm:text-[26px] sm:leading-[30px]">
                    <SubjectTitle
                      subjectTitle={w.subjectTitle}
                      creator={w.creator}
                      kind={w.kind}
                    />
                  </h3>
                  <p className="meta-caps leading-none">{formatDate(w.date)}</p>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex justify-center pt-6 pb-6">
            <a
              href="#writings"
              className="text-[14px] uppercase tracking-[1px] text-[#140d05] hover:opacity-60"
            >
              Read all issues →
            </a>
          </div>
        </div>

        <div className="order-1 flex flex-col page:order-none page:col-[8/span_8]">
          <SectionHeading
            soft={settings.newsletterTitle}
            strong={settings.newsletterSubtitle}
          />
          <form
            className="pt-16"
            aria-label="Newsletter signup"
            // M1: static form; wiring arrives with the subscribers table (M9)
          >
            <div className="flex items-center justify-between bg-[#f9f9f9] px-4 py-2">
              <label
                htmlFor="newsletter-email"
                className="font-mono text-[12px] leading-[18px] text-black/80"
              >
                {settings.newsletterLabel}
              </label>
            </div>
            <div className="mt-px flex h-16 items-center justify-between bg-[#f9f9f9] px-4">
              <input
                id="newsletter-email"
                type="email"
                placeholder={settings.newsletterPlaceholder}
                className="w-full bg-transparent text-[16px] tracking-[-0.31px] outline-none placeholder:text-black/50"
              />
              <button
                type="submit"
                aria-label="Subscribe to newsletter"
                className="flex size-6 shrink-0 items-center justify-center hover:opacity-60"
              >
                {/* arrow.svg from the design, inlined for crispness */}
                <Image src="/images/arrow.svg" alt="" width={12} height={12} className="size-3" />
              </button>
            </div>
          </form>

          <div className="flex grow flex-col justify-end pt-24 page:pt-40">
            <div className="flex flex-col gap-4 text-[12px] leading-[18px] text-black/60 sm:flex-row sm:items-center sm:justify-between">
              <p>{settings.copyright}</p>
              <ul className="flex items-center gap-4">
                {settings.social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} className="hover:opacity-60">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
