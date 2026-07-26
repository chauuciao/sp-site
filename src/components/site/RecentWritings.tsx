"use client";

import Image from "next/image";
import { useState } from "react";
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
 * Tab semantics:
 *  - Featured: entries with actual written review text — his writings
 *  - Recent:   everything, newest first (the incoming order)
 *  - Books / Films: by kind
 */
const FILTERS: Record<string, (w: WritingDoc) => boolean> = {
  featured: (w) => Boolean(w.reviewHtml ?? w.featured),
  recent: () => true,
  books: (w) => w.kind === "book",
  films: (w) => w.kind === "film",
};

export function RecentWritings({
  settings,
  writings,
}: {
  settings: SettingsDoc;
  writings: WritingDoc[];
}) {
  const [active, setActive] = useState(settings.filterTabs[0] ?? "Featured");
  const predicate = FILTERS[active.toLowerCase()] ?? FILTERS.recent;
  const visible = writings.filter(predicate);

  return (
    <section id="writings" className="px-6 pt-16 pb-24 page:pt-[120px]">
      <div className="page:grid page:grid-cols-16 page:gap-x-[10px]">
        <div className="flex flex-col gap-10 page:col-[8/span_8] page:max-w-[705px]">
          <SectionHeading
            soft={settings.writingsTitle}
            strong={settings.writingsSubtitle}
          />
          <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter writings">
            {settings.filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={tab === active}
                onClick={() => setActive(tab)}
                className={`h-[50px] cursor-pointer border-2 border-black/5 px-[18px] py-[10px] font-mono text-[16px] leading-[30px] text-black/60 transition-colors hover:bg-black/5 ${
                  tab === active ? "bg-black/5" : ""
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <ul className="border-t border-line">
            {visible.map((w) => (
              <WritingRow key={w.slug} writing={w} />
            ))}
            {visible.length === 0 && (
              <li className="py-8 text-[16px] text-ink-soft">
                Nothing here yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
