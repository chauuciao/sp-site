import { kindHasCreator, type ReviewKind } from "@/content/fixtures";

/**
 * Books render "Bend Sinister *by* Vladimir Nabokov", films use "dir.".
 * Blog and travel entries are plain titles — no creator construction.
 */
export function SubjectTitle({
  subjectTitle,
  creator,
  kind,
  className = "",
}: {
  subjectTitle: string;
  creator: string;
  kind: ReviewKind;
  className?: string;
}) {
  if (!kindHasCreator(kind) || !creator) {
    return <span className={`font-serif ${className}`}>{subjectTitle}</span>;
  }
  return (
    <span className={`font-serif ${className}`}>
      {subjectTitle} <i>{kind === "book" ? "by" : "dir."}</i> {creator}
    </span>
  );
}
