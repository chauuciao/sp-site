import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { FeaturedCard, HeroIntro } from "@/components/site/Hero";
import { Journeys } from "@/components/site/Journeys";
import { RecentWritings } from "@/components/site/RecentWritings";
import { getHomePageData } from "@/lib/data";
import { getOwnerSession } from "@/lib/session";

// Firestore reads happen per-request; revisit caching (revalidateTag) in M4.
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getOwnerSession();
  const { settings, writings, journeys, live } = await getHomePageData({
    includeDrafts: !!session,
  });

  return (
    <>
      <Header settings={settings} canEdit={!!session} />
      <main data-content-source={live ? "firestore" : "fixtures"}>
        {/* Hero + writings share one grid: the featured card cell spans both
            rows so the card can stick while the list scrolls beside it. */}
        {/* capped at the design's 1710px canvas — wider screens get margins,
            proportions hold */}
        <section className="mx-auto flex w-full max-w-[1710px] flex-col gap-12 px-6 pt-12 pb-24 page:grid page:grid-cols-16 page:grid-rows-[auto_1fr] page:gap-x-[10px] page:gap-y-0 page:pt-[220px]">
          <div className="order-2 page:order-none page:col-[1/span_5] page:row-[1/span_2]">
            <div className="page:sticky page:top-6">
              <FeaturedCard writings={writings} />
            </div>
          </div>
          <div className="order-1 page:order-none page:col-[8/span_8] page:row-1">
            <HeroIntro settings={settings} />
          </div>
          <div className="order-3 page:order-none page:col-[8/span_8] page:row-2">
            <RecentWritings settings={settings} writings={writings} />
          </div>
        </section>
        <Journeys
          settings={settings}
          journeys={journeys}
          travels={writings.filter(
            (w) => w.kind === "travel" && (session || w.status !== "draft"),
          )}
        />
      </main>
      <Footer settings={settings} writings={writings} />
    </>
  );
}
