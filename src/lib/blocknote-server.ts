import "server-only";

import { ServerBlockNoteEditor } from "@blocknote/server-util";
import type { Block } from "@blocknote/core";

/**
 * Server-side BlockNote renderer. Public pages render prose through this so
 * view mode and edit mode emit the same DOM with the same class names —
 * "identical by construction" (see plan: editor/public-page consistency).
 */
const serverEditor = ServerBlockNoteEditor.create();

export async function renderBodyJson(bodyJson: string): Promise<string> {
  try {
    const blocks = JSON.parse(bodyJson) as Block[];
    return await serverEditor.blocksToFullHTML(blocks);
  } catch {
    return "";
  }
}
