"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect } from "react";

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
    initialContent: bodyJson ? JSON.parse(bodyJson) : undefined,
    // drag-drop / paste / slash-menu image blocks route through our pipeline
    uploadFile: async (file: File) => {
      const { uploadImage } = await import("@/lib/upload-client");
      const { url } = await uploadImage(file, { kind: "body", docId });
      return url;
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
      onChange={() => onChange(JSON.stringify(editor.document))}
    />
  );
}
