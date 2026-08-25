import Image from "next/image";
import { KIND_LABEL } from "@/content/fixtures";
import type { SettingsDoc, WritingDoc } from "@/lib/data";
import { SubjectTitle } from "./SubjectTitle";

/**
 * Hero card palette: deep editorial tones, all safe under white text.
 * The slug hash picks one deterministically — same post, same colour;
 * new hero, (usually) new colour. Forest green stays the design's anchor.
 */
const HERO_COLORS = [
  "#2b4742", // forest (the original)
  "#472b33", // wine
  "#2b3247", // midnight
  "#47372b", // umber
  "#3a2b47", // plum
];

function heroColor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return HERO_COLORS[Math.abs(h) % HERO_COLORS.length];
}

/** The hero card: always the latest written entry (design: hero cols 1–5). */
export function FeaturedCard({ writings }: { writings: WritingDoc[] }) {
  // incoming order is date desc; travel lives in Journeys, not here
  const featured = writings.find((w) => w.kind !== "travel");
  if (!featured) return null;

  return (
    <a
      href={`/writings/${featured.slug}`}
      /* fixed to HeroIntro's height so card and intro share a bottom edge;
         overflow-hidden + clamped blurb keep long content inside */
      className="flex flex-col overflow-hidden p-8 page:h-[calc(100svh-330px)]"
      style={{ backgroundColor: heroColor(featured.slug) }}
    >
      <div className="flex min-h-[492px] flex-1 flex-col justify-between gap-10 page:min-h-0">
        <Image
          src={featured.thumbnail}
          alt={`Cover of ${featured.subjectTitle}`}
          width={620}
          height={950}
          className="h-[var(--cover-height)] min-h-[120px] w-auto max-w-full shrink self-start border-[1.2px] border-black/5"
        />
        <div className="flex flex-col gap-7 pb-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-card text-white">
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
            <p className="line-clamp-3 text-[16px] leading-[27px] text-white opacity-80">
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
    /* 330px = header (~62) + section's 220px top padding + 48px bottom gap:
       hero fills the first viewport, nothing touches the fold */
    <div className="flex flex-col justify-end page:min-h-[calc(100svh-330px)]">
      <h1 className="text-display tracking-[-1.2px]">
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
