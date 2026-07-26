import type { ReviewKind } from "@/content/fixtures";

/**
 * Renders "Bend Sinister *by* Vladimir Nabokov" — Garamond, with the joining
 * word italicised, as in the design. Films use "dir." instead of "by".
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
  return (
    <span className={`font-serif ${className}`}>
      {subjectTitle} <i>{kind === "book" ? "by" : "dir."}</i> {creator}
    </span>
  );
}
