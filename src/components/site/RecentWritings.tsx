import Image from "next/image";
import { formatDate } from "@/content/fixtures";
import type { SettingsDoc, WritingDoc } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";
import { SubjectTitle } from "./SubjectTitle";

function WritingRow({ writing }: { writing: WritingDoc }) {
  return (
    <li className="border-b border-line">
      <a
        href={`/writings/${writing.slug}`}
        className="group flex items-start justify-between gap-8 py-[15px]"
      >
        <div className="flex flex-col gap-2 pt-2">
          <h3 className="text-[22px] leading-[1.15] tracking-[-0.78px] group-hover:opacity-60 sm:text-[26px] sm:leading-[30px]">
            <SubjectTitle
              subjectTitle={writing.subjectTitle}
              creator={writing.creator}
              kind={writing.kind}
            />
          </h3>
          <p className="meta-caps leading-none">{formatDate(writing.date)}</p>
        </div>
        <div className="relative aspect-[310/475] w-[76px] shrink-0 border-[1.2px] border-black/5 sm:w-[118px]">
          <Image
            src={writing.thumbnail}
            alt=""
            fill
            sizes="118px"
            className="object-cover"
          />
        </div>
      </a>
    </li>
  );
}

/**
 * Responsive decision: the section keeps the design's right-column offset
 * (cols 8–15) at `page`; below that it spans the full width. Filter tabs are
 * static in M1 — they become interactive when wired to real queries in M6.
 */
export function RecentWritings({
  settings,
  writings,
}: {
  settings: SettingsDoc;
  writings: WritingDoc[];
}) {
  return (
    <section id="writings" className="px-6 pt-16 pb-24 page:pt-[120px]">
      <div className="page:grid page:grid-cols-16 page:gap-x-[10px]">
        <div className="flex flex-col gap-10 page:col-[8/span_8] page:max-w-[705px]">
          <SectionHeading
            soft={settings.writingsTitle}
            strong={settings.writingsSubtitle}
          />
          <div className="flex flex-wrap gap-3">
            {settings.filterTabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`h-[50px] border-2 border-black/5 px-[18px] py-[10px] font-mono text-[16px] leading-[30px] text-black/60 ${
                  i === 0 ? "bg-black/5" : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ul className="border-t border-line">
            {writings.map((w) => (
              <WritingRow key={w.slug} writing={w} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
