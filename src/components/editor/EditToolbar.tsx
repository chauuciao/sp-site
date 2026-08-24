"use client";

/**
 * The entire edit chrome: a slim floating bar, bottom-centre, only rendered
 * for the owner. No admin shell, no sidebar (see plan).
 */
export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const SAVE_LABEL: Record<SaveState, string> = {
  idle: "",
  dirty: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Couldn’t save — retrying",
};

export function EditToolbar({
  editing,
  saveState,
  status,
  onToggle,
  onPublishToggle,
  onDelete,
  onSignOut,
}: {
  editing: boolean;
  saveState: SaveState;
  status: "draft" | "published";
  onToggle: () => void;
  onPublishToggle: () => void;
  onDelete: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 bg-ink px-5 py-3 text-[13px] text-white shadow-lg">
      {status === "draft" && (
        <span className="bg-white/15 px-2 py-0.5 text-[11px] uppercase tracking-[1px] text-white/80">
          Draft
        </span>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="cursor-pointer font-medium uppercase tracking-[1px] hover:opacity-70"
      >
        {editing ? "Done" : "Edit"}
      </button>
      {editing && saveState !== "idle" && (
        <span className="text-white/60" aria-live="polite">
          {SAVE_LABEL[saveState]}
        </span>
      )}
      <button
        type="button"
        onClick={onPublishToggle}
        className="cursor-pointer uppercase tracking-[1px] text-white/80 hover:text-white"
      >
        {status === "draft" ? "Publish" : "Unpublish"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="cursor-pointer text-white/50 hover:text-red-300"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={onSignOut}
        className="cursor-pointer text-white/50 hover:text-white"
      >
        Sign out
      </button>
    </div>
  );
}
