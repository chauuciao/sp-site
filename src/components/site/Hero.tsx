import Image from "next/image";
import { KIND_LABEL } from "@/content/fixtures";
import type { SettingsDoc, WritingDoc } from "@/lib/data";
import { SubjectTitle } from "./SubjectTitle";

/** The forest-green hero card: always the latest written entry (design: hero cols 1–5). */
export function FeaturedCard({ writings }: { writings: WritingDoc[] }) {
  // incoming order is date desc; travel lives in Journeys, not here
  const featured = writings.find((w) => w.kind !== "travel");
  if (!featured) return null;

  return (
    <a href={`/writings/${featured.slug}`} className="block bg-forest p-8">
      <div className="flex h-full min-h-[492px] flex-col justify-between gap-10">
        <div className="relative h-[200px] w-[131px] border-[1.2px] border-black/5">
          <Image
            src={featured.thumbnail}
            alt={`Cover of ${featured.subjectTitle}`}
            fill
            sizes="131px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-7 pb-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] leading-[1.4] text-white sm:text-[32px] sm:leading-[48px]">
              <SubjectTitle
                subjectTitle={featured.subjectTitle}
                creator={featured.creator}
                kind={featured.kind}
              />
            </h2>
            <p className="text-[16px] uppercase leading-[22.4px] tracking-[1.6px] text-white/50 opacity-80">
              {KIND_LABEL[featured.kind]}
            </p>
          </div>
          {featured.blurb && (
            <p className="text-[16px] leading-[27px] text-white opacity-80">
              {featured.blurb}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

/** The big intro paragraph (design: hero cols 8–15, bottom-aligned). */
export function HeroIntro({ settings }: { settings: SettingsDoc }) {
  return (
    <div className="flex flex-col justify-end page:min-h-[556px] page:max-w-[705px]">
      <h1 className="text-[28px] leading-[1.2] tracking-[-1.2px] sm:text-[36px]">
        {settings.heroLead}{" "}
        <span className="text-ink-soft">
          {settings.heroRest}
          <br aria-hidden />
          <br aria-hidden />
          {settings.heroSecond}
        </span>
      </h1>
    </div>
  );
}
