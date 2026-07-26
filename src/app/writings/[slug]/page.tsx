import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SubjectTitle } from "@/components/site/SubjectTitle";
import { formatDate } from "@/content/fixtures";
import { getReviewBySlug, getHomePageData } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Review page, minimal M2 version: renders the imported Goodreads review
 * HTML. Replaced by the BlockNote-rendered body in M4 — the route and layout
 * stay, only the body source changes.
 */
export default async function WritingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [review, { settings, writings }] = await Promise.all([
    getReviewBySlug(slug),
    getHomePageData(),
  ]);
  if (!review) notFound();

  return (
    <>
      <Header settings={settings} />
      <main className="px-6 pb-24">
        <article className="mx-auto flex w-full max-w-[705px] flex-col gap-8 pt-16">
          <div className="relative aspect-[310/475] w-[140px] border-[1.2px] border-black/5">
            <Image
              src={review.thumbnail}
              alt={`Cover of ${review.subjectTitle}`}
              fill
              sizes="140px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] leading-[1.2] tracking-[-0.9px] sm:text-[40px]">
              <SubjectTitle
                subjectTitle={review.subjectTitle}
                creator={review.creator}
                kind={review.kind}
              />
            </h1>
            <p className="meta-caps">
              {review.kind === "book" ? "Book Review" : "Film Review"} ·{" "}
              {formatDate(review.date)}
              {review.rating ? ` · ${"★".repeat(review.rating)}` : ""}
            </p>
          </div>
          {review.reviewHtml ? (
            <div
              className="prose-review text-[17px] leading-[30px] text-ink/90"
              // Trusted content: his own Goodreads review HTML, imported verbatim
              dangerouslySetInnerHTML={{ __html: review.reviewHtml }}
            />
          ) : (
            <p className="text-[17px] leading-[30px] text-ink-soft">
              No written review yet
              {review.rating ? ` — rated ${"★".repeat(review.rating)}` : ""}.
            </p>
          )}
        </article>
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
