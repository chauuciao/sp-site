import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewArticle } from "@/components/editor/ReviewArticle";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { renderBodyJson } from "@/lib/blocknote-server";
import { getReviewBySlug, getHomePageData } from "@/lib/data";
import { getOwnerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [review, { settings, writings }, session] = await Promise.all([
    getReviewBySlug(slug),
    getHomePageData(),
    getOwnerSession(),
  ]);
  if (!review) notFound();

  const bodyHtml = review.bodyJson ? await renderBodyJson(review.bodyJson) : "";

  return (
    <>
      <Header settings={settings} canEdit={!!session} />
      <main className="px-6 pb-24">
        <ReviewArticle review={review} bodyHtml={bodyHtml} canEdit={!!session} />
      </main>
      <Footer settings={settings} writings={writings} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReviewBySlug(slug);
  if (!review) return {};
  return {
    title: `${review.subjectTitle} — Shrikant Pandey`,
    description: review.blurb ?? undefined,
  };
}
