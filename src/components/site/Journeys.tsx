import Image from "next/image";
import type { JourneyDoc, SettingsDoc, WritingDoc } from "@/lib/data";
import { SectionHeading } from "./SectionHeading";

interface Tile {
  key: string;
  href: string | null;
  image: string;
  place: string;
  country: string;
  year: number;
}

function JourneyTile({ tile }: { tile: Tile }) {
  const inner = (
    <>
      <Image
        src={tile.image}
        alt={`${tile.place}, ${tile.country}`}
        fill
        sizes="(max-width: 640px) 85vw, 500px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/[0.37] transition-colors duration-500 group-hover:bg-black/[0.25]" />
      <div className="absolute inset-0 flex flex-col items-center justify-between py-12 text-center text-white">
        <p className="text-[16px] leading-6 tracking-[-0.31px]">{tile.year}</p>
        <p className="font-serif text-place italic">
          {tile.place}
        </p>
        <p className="text-[16px] leading-6 tracking-[-0.31px] opacity-60">
          {tile.country}
        </p>
      </div>
    </>
  );

  return (
    <li className="h-[min(700px,120vw)] w-[min(500px,85vw)] shrink-0 snap-start">
      {/* relative + overflow-hidden on the SAME element: the fill image
          anchors here, so the hover zoom clips instead of escaping */}
      {tile.href ? (
        <a href={tile.href} className="group relative block h-full w-full overflow-hidden">
          {inner}
        </a>
      ) : (
        <div className="group relative h-full w-full overflow-hidden">{inner}</div>
      )}
    </li>
  );
}

/**
 * Travel entries (kind=travel) are the tiles; each links to its own page.
 * Legacy `journeys` docs render only while no travel entries exist.
 */
export function Journeys({
  settings,
  journeys,
  travels,
}: {
  settings: SettingsDoc;
  journeys: JourneyDoc[];
  travels: WritingDoc[];
}) {
  const tiles: Tile[] =
    travels.length > 0
      ? travels.map((w) => ({
          key: w.slug,
          href: `/writings/${w.slug}`,
          image: w.thumbnail,
          place: w.subjectTitle,
          country: w.country ?? "",
          year: new Date(w.date + "T00:00:00").getFullYear(),
        }))
      : journeys.map((j) => ({
          key: j.id,
          href: null,
          image: j.image,
          place: j.place,
          country: j.country,
          year: j.year,
        }));

  return (
    <section id="journeys">
      <div className="flex flex-col gap-1 p-6">
        <SectionHeading
          soft={settings.journeysTitle}
          strong={settings.journeysSubtitle}
        />
      </div>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 scroll-px-6">
        {tiles.map((t) => (
          <JourneyTile key={t.key} tile={t} />
        ))}
      </ul>
    </section>
  );
}
