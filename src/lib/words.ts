import type { WritingDoc } from "./data";

/** Word count from the authoritative body (blocks if edited, else HTML). */
export function wordCount(w: Pick<WritingDoc, "bodyJson" | "reviewHtml">): number {
  let text = "";
  if (w.bodyJson) {
    try {
      const collect = (node: unknown): string => {
        if (typeof node !== "object" || node === null) return "";
        if ("text" in node && typeof (node as { text: unknown }).text === "string") {
          return (node as { text: string }).text + " ";
        }
        return Object.values(node).map(collect).join("");
      };
      text = collect(JSON.parse(w.bodyJson));
    } catch {
      text = "";
    }
  }
  if (!text && w.reviewHtml) {
    text = w.reviewHtml.replace(/<[^>]+>/g, " ");
  }
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
