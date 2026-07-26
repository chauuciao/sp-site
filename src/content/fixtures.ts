/**
 * M1 fixture data — stands in for the database until M2.
 * Shapes mirror the planned Drizzle schema (see plan: content model).
 */

export type ReviewKind = "book" | "film" | "blog" | "travel";

export const KIND_LABEL: Record<ReviewKind, string> = {
  book: "Book Review",
  film: "Film Review",
  blog: "Blog",
  travel: "Travel",
};

/** blog/travel entries are plain titles — no "X by Y" construction */
export function kindHasCreator(kind: ReviewKind): boolean {
  return kind === "book" || kind === "film";
}

export interface WritingFixture {
  slug: string;
  kind: ReviewKind;
  /** Book or film title, e.g. "Bend Sinister" */
  subjectTitle: string;
  /** Author (books) or director (films) */
  creator: string;
  date: string; // ISO
  thumbnail: string;
  featured?: boolean;
  blurb?: string;
  /** 1–5, from his Goodreads shelf where available */
  rating?: number;
}

export interface JourneyFixture {
  place: string;
  country: string;
  year: number;
  image: string;
}

export const settings = {
  wordmark: "Shrikant Pandey",
  contactEmail: "pandey.shrikant@gmail.com",
  nav: [
    { label: "Writings", href: "/#writings" },
    { label: "Newsletter", href: "/#newsletter" },
    { label: "Copy Email", href: "#copy-email" },
  ],
  heroLead: "Shrikant Pandey",
  heroRest:
    "is an engineer by profession and a runner, reader, and film lover by inclination.",
  heroSecond:
    "When away from work you’ll find him training for marathons, moving between fiction and non-fiction, and watching films worth thinking about.",
  writingsTitle: "Recent Writings",
  writingsSubtitle: "Books, Film, Travel, Musings",
  filterTabs: ["Featured", "Recent", "Books", "Films"],
  journeysTitle: "Journeys.",
  journeysSubtitle: "Life away from the screen.",
  newsletterTitle: "Keep in touch.",
  newsletterSubtitle: "Get updates when I post.",
  newsletterPlaceholder: "john@acme.co",
  newsletterLabel: "Enter your email address",
  copyright: "© 2026 Shrikant Pandey. All Rights Reserved.",
  social: [
    { label: "LinkedIn", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "Goodreads", href: "#" },
  ],
  portrait: "/images/portrait.png",
};

/**
 * Books are real — pulled from his Goodreads "read" shelf
 * (goodreads.com/review/list/36896623, fetched 2026-07-26).
 * The three films are placeholders until he writes film reviews.
 */
export const writings: WritingFixture[] = [
  {
    slug: "bend-sinister",
    kind: "book",
    subjectTitle: "Bend Sinister",
    creator: "Vladimir Nabokov",
    date: "2026-07-24",
    thumbnail: "/images/cover-bend-sinister-gr.jpg",
    featured: true,
    rating: 5,
    blurb:
      "Finished reading Bend Sinister, Vladimir Nabokov’s 179-page-long novel. I would place it among the most brilliant books I have read; at the same time, however, I found it exceptionally demanding and not easily accessible, owing to its extraordinarily literary tone.",
  },
  {
    slug: "chandpur-ki-chanda",
    kind: "book",
    subjectTitle: "Chandpur Ki Chanda",
    creator: "Atul Kumar Rai",
    date: "2026-06-28",
    thumbnail: "/images/cover-chandpur.jpg",
    rating: 5,
  },
  {
    slug: "india-the-road-ahead",
    kind: "book",
    subjectTitle: "India: The Road Ahead",
    creator: "Mark Tully",
    date: "2026-05-02",
    thumbnail: "/images/cover-india-road-ahead.jpg",
    rating: 4,
  },
  {
    slug: "a-drop-of-blood",
    kind: "book",
    subjectTitle: "A Drop of Blood",
    creator: "Joginder Paul",
    date: "2026-03-22",
    thumbnail: "/images/cover-drop-of-blood.jpg",
    rating: 4,
  },
  {
    slug: "12th-fail",
    kind: "film",
    subjectTitle: "12th Fail",
    creator: "Vidhu Vinod Chopra",
    date: "2026-03-01",
    thumbnail: "/images/cover-bend-sinister.png",
  },
  {
    slug: "lapoojhanna",
    kind: "book",
    subjectTitle: "Lapoojhanna",
    creator: "Ashok Pande",
    date: "2026-02-06",
    thumbnail: "/images/cover-lapoojhanna.jpg",
    rating: 4,
  },
  {
    slug: "chakka-jaam",
    kind: "book",
    subjectTitle: "Chakka Jaam",
    creator: "Gautam Choubey",
    date: "2025-12-19",
    thumbnail: "/images/cover-chakka-jaam.jpg",
    rating: 5,
  },
  {
    slug: "ikiru",
    kind: "film",
    subjectTitle: "Ikiru",
    creator: "Akira Kurosawa",
    date: "2025-12-02",
    thumbnail: "/images/cover-bend-sinister.png",
  },
  {
    slug: "the-lunchbox",
    kind: "film",
    subjectTitle: "The Lunchbox",
    creator: "Ritesh Batra",
    date: "2025-11-12",
    thumbnail: "/images/cover-bend-sinister.png",
  },
];

export const journeys: JourneyFixture[] = [
  { place: "Phuket", country: "Thailand", year: 2025, image: "/images/journey-1.png" },
  { place: "Sigiriya", country: "Sri Lanka", year: 2025, image: "/images/journey-2.png" },
  { place: "Ha Long Bay", country: "Vietnam", year: 2024, image: "/images/journey-3.png" },
  { place: "Krabi", country: "Thailand", year: 2024, image: "/images/journey-4.png" },
];

export function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
