import Image from "next/image";
import { KIND_LABEL } from "@/content/fixtures";
import type { WritingDoc } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";

/**
 * "You might also like" before the article footer — travel-tile styling
 * (full-bleed image, overlay, year / serif title / label), filled with
 * same-kind posts first, padded with recent others up to three.
 */
export function RelatedPosts({
  current,
  writings,
}: {
  current: WritingDoc;
  writings: WritingDoc[];
}) {
  const others = writings.filter((w) => w.slug !== current.slug);
  const sameKind = others.filter((w) => w.kind === current.kind);
  const pad = others.filter(
    (w) => w.kind !== current.kind && w.kind !== "travel",
  );
  const picks = [...sameKind, ...pad].slice(0, 3);
  if (picks.length === 0) return null;

  return (
    <section className="pb-4">
      <div className="mx-auto flex w-full max-w-[1710px] flex-col gap-1 p-6">
        <SectionHeading soft="Read more." strong="You might also like." />
      </div>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 scroll-px-6">
        {picks.map((w) => (
          <li
            key={w.slug}
            className="h-[min(700px,120vw)] w-[min(500px,85vw)] shrink-0 snap-start"
          >
            <a
              href={`/writings/${w.slug}`}
              className="group relative block h-full w-full overflow-hidden"
            >
              <Image
                src={w.thumbnail}
                alt=""
                fill
                sizes="(max-width: 640px) 85vw, 500px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/[0.45] transition-colors duration-500 group-hover:bg-black/[0.3]" />
              <div className="absolute inset-0 flex flex-col items-center justify-between px-8 py-12 text-center text-white">
                <p className="text-[16px] leading-6 tracking-[-0.31px]">
                  {new Date(w.date + "T00:00:00").getFullYear()}
                </p>
                <p className="font-serif text-[clamp(28px,2.3vw,40px)] italic leading-[1.35]">
                  {w.subjectTitle}
                </p>
                <p className="text-[16px] leading-6 tracking-[-0.31px] opacity-60">
                  {KIND_LABEL[w.kind]}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
