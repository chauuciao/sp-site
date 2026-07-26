import Image from "next/image";
import { journeys, settings, type JourneyFixture } from "@/content/fixtures";
import { SectionHeading } from "./SectionHeading";

function JourneyCard({ journey }: { journey: JourneyFixture }) {
  return (
    <li className="relative h-[min(700px,120vw)] w-[min(500px,85vw)] shrink-0 snap-start overflow-hidden">
      <Image
        src={journey.image}
        alt={`${journey.place}, ${journey.country}`}
        fill
        sizes="(max-width: 640px) 85vw, 500px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/[0.37]" />
      <div className="absolute inset-0 flex flex-col items-center justify-between py-12 text-center text-white">
        <p className="text-[16px] leading-6 tracking-[-0.31px]">{journey.year}</p>
        <p className="font-serif text-[44px] italic leading-[1.4] sm:text-[64px]">
          {journey.place}
        </p>
        <p className="text-[16px] leading-6 tracking-[-0.31px] opacity-60">
          {journey.country}
        </p>
      </div>
    </li>
  );
}

/**
 * Responsive decision: the design's card row (2036px inside a 1710px frame)
 * is an intentional overflow — implemented as a scroll-snap strip at every
 * width. Cards shrink fluidly below 500px via min().
 */
export function Journeys() {
  return (
    <section>
      <div className="flex flex-col gap-1 p-6">
        <SectionHeading
          soft={settings.journeysTitle}
          strong={settings.journeysSubtitle}
        />
      </div>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto">
        {journeys.map((j) => (
          <JourneyCard key={`${j.place}-${j.year}`} journey={j} />
        ))}
      </ul>
    </section>
  );
}
