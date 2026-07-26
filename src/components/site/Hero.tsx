import Image from "next/image";
import { settings, writings } from "@/content/fixtures";
import { SubjectTitle } from "./SubjectTitle";

/**
 * Hero: featured review card (forest green, cols 1–5) beside the intro
 * heading (cols 8–15, bottom-aligned). Responsive decision: below `page`
 * (1100px) the two columns stack — intro first (it introduces the site),
 * then the featured card at its natural width.
 */
export function Hero() {
  const featured = writings.find((w) => w.featured) ?? writings[0];

  return (
    <section className="px-6 pt-12 pb-16 page:pt-[220px] page:pb-16">
      <div className="flex flex-col-reverse gap-12 page:grid page:grid-cols-16 page:gap-x-[10px]">
        <div className="bg-forest p-8 page:col-[1/span_5]">
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
                  {featured.kind === "book" ? "Book Review" : "Film Review"}
                </p>
              </div>
              <p className="text-[16px] leading-[27px] text-white opacity-80">
                {featured.blurb}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-end page:col-[8/span_8] page:max-w-[705px]">
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
      </div>
    </section>
  );
}
