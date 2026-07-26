import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
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
        <Hero settings={settings} writings={writings} />
        <RecentWritings settings={settings} writings={writings} />
        <Journeys settings={settings} journeys={journeys} />
      </main>
      <Footer settings={settings} writings={writings} />
    </>
  );
}
