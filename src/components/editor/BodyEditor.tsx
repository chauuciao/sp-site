"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import {
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { useEffect } from "react";

/**
 * Trimmed schema: only the blocks long-form reviews actually need. This
 * is what keeps the slash menu short and unintimidating — no tables,
 * code, video/audio/file embeds, or toggles.
 */
const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    quote: defaultBlockSpecs.quote,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    image: defaultBlockSpecs.image,
  },
});

const ALLOWED = new Set(Object.keys(schema.blockSpecs));

/** The slash menu he actually sees — schema trimming alone still leaks
 *  toggle headings, H4–6, and the emoji picker. */
const MENU_ITEMS = new Set([
  "Heading 2",
  "Heading 3",
  "Quote",
  "Bullet List",
  "Numbered List",
  "Paragraph",
  "Image",
]);

/** Old bodyJson may hold block types we no longer offer — coerce them to
 *  paragraphs rather than crashing the editor. */
function sanitize(blocks: unknown): unknown[] | undefined {
  if (!Array.isArray(blocks)) return undefined;
  return blocks.map((b) => {
    const block = b as { type?: string; children?: unknown };
    const safe = ALLOWED.has(block.type ?? "") ? block : { ...block, type: "paragraph", props: {} };
    return { ...safe, children: sanitize(block.children) ?? [] };
  });
}

/**
 * BlockNote body editor. Initial content comes from bodyJson (previous
 * edits) or is parsed out of the imported Goodreads reviewHtml on first
 * edit. Emits serialized blocks on every change.
 */
export default function BodyEditor({
  bodyJson,
  reviewHtml,
  docId,
  onChange,
}: {
  bodyJson: string | null | undefined;
  reviewHtml: string | null | undefined;
  docId: string;
  onChange: (bodyJson: string) => void;
}) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: bodyJson
      ? (sanitize(JSON.parse(bodyJson)) as never)
      : undefined,
    // drag-drop / paste / slash-menu image blocks route through our pipeline.
    // BlockNote swallows upload errors silently ("Add image" just does
    // nothing) — surface them so a failed photo isn't a mystery.
    uploadFile: async (file: File) => {
      const { uploadImage } = await import("@/lib/upload-client");
      try {
        const { url } = await uploadImage(file, { kind: "body", docId });
        return url;
      } catch (e) {
        window.alert(`Couldn’t add the image: ${(e as Error).message}`);
        throw e;
      }
    },
  });

  // First edit of an imported review: seed the editor from its HTML.
  useEffect(() => {
    if (!bodyJson && reviewHtml) {
      // Goodreads-imported HTML separates paragraphs with double <br>;
      // convert to real <p>s first or parsing yields a few giant blocks
      const html = /<p[\s>]/i.test(reviewHtml)
        ? reviewHtml
        : `<p>${reviewHtml.replace(/(<br\s*\/?>\s*){2,}/gi, "</p><p>")}</p>`;
      const blocks = editor.tryParseHTMLToBlocks(html);
      editor.replaceBlocks(editor.document, blocks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      slashMenu={false}
      onChange={() => onChange(JSON.stringify(editor.document))}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            getDefaultReactSlashMenuItems(editor).filter((i) =>
              MENU_ITEMS.has(i.title),
            ),
            query,
          )
        }
      />
    </BlockNoteView>
  );
}
