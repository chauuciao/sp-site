import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Journeys } from "@/components/site/Journeys";
import { RecentWritings } from "@/components/site/RecentWritings";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <RecentWritings />
        <Journeys />
      </main>
      <Footer />
    </>
  );
}
