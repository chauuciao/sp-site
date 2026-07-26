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
  onChange,
}: {
  bodyJson: string | null | undefined;
  reviewHtml: string | null | undefined;
  onChange: (bodyJson: string) => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: bodyJson ? JSON.parse(bodyJson) : undefined,
  });

  // First edit of an imported review: seed the editor from its HTML.
  useEffect(() => {
    if (!bodyJson && reviewHtml) {
      const blocks = editor.tryParseHTMLToBlocks(reviewHtml);
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
