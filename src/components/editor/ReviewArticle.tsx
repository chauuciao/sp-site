"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteReview,
  saveReview,
  setReviewStatus,
  type SaveReviewPatch,
} from "@/app/actions/content";
import {
  formatDate,
  KIND_LABEL,
  kindHasCreator,
  type ReviewKind,
} from "@/content/fixtures";
import type { WritingDoc } from "@/lib/data";
import { uploadImage } from "@/lib/upload-client";
import { EditToolbar, type SaveState } from "./EditToolbar";
import { EditableText } from "./EditableText";

const BodyEditor = dynamic(() => import("./BodyEditor"), {
  ssr: false,
  loading: () => <p className="text-ink-soft">Loading editor…</p>,
});

/**
 * The article, in both lives. View mode renders exactly what visitors see
 * (bodyHtml server-rendered). For the owner, the toolbar flips leaf nodes
 * editable in place — same elements, same classes, no second tree.
 */
export function ReviewArticle({
  review,
  bodyHtml,
  canEdit,
}: {
  review: WritingDoc;
  bodyHtml: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [status, setStatus] = useState<"draft" | "published">(
    review.status ?? "published",
  );
  const [kind, setKind] = useState<ReviewKind>(review.kind);
  const [thumbnail, setThumbnail] = useState(review.thumbnail);
  const [uploadError, setUploadError] = useState("");

  const pending = useRef<SaveReviewPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const slugRef = useRef(review.slug);

  const flush = useCallback(async () => {
    if (!review.docId || Object.keys(pending.current).length === 0) return;
    const patch = pending.current;
    pending.current = {};
    setSaveState("saving");
    try {
      const res = await saveReview(review.docId, patch);
      if (res.slug) slugRef.current = res.slug;
      setSaveState(Object.keys(pending.current).length ? "dirty" : "saved");
    } catch {
      // merge the failed patch back and retry on next tick
      pending.current = { ...patch, ...pending.current };
      setSaveState("error");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 3000);
    }
  }, [review.docId]);

  const queue = useCallback(
    (patch: SaveReviewPatch) => {
      pending.current = { ...pending.current, ...patch };
      setSaveState("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 800);
    },
    [flush],
  );

  // Flush on tab close — the laptop-lid insurance
  useEffect(() => {
    const h = () => void flush();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [flush]);

  async function signOut() {
    await flush();
    await fetch("/api/session", { method: "DELETE" });
    router.refresh();
  }

  function toggle() {
    if (editing) {
      void flush().then(() => {
        // slug may have been re-derived from the title on first save
        if (slugRef.current !== review.slug) {
          router.replace(`/writings/${slugRef.current}`);
        } else {
          router.refresh();
        }
      });
    }
    setEditing(!editing);
  }

  async function publishToggle() {
    if (!review.docId) return;
    await flush();
    const next = status === "draft" ? "published" : "draft";
    setStatus(next);
    try {
      await setReviewStatus(review.docId, next);
      router.refresh();
    } catch {
      setStatus(status); // roll back on failure
    }
  }

  async function remove() {
    if (!review.docId) return;
    const ok = window.confirm(
      `Delete “${review.subjectTitle}”? This can’t be undone.`,
    );
    if (!ok) return;
    await deleteReview(review.docId);
    router.replace("/");
    router.refresh();
  }

  async function replaceCover(file: File) {
    if (!review.docId) return;
    setUploadError("");
    try {
      const { url } = await uploadImage(file, { kind: "cover", docId: review.docId });
      setThumbnail(url);
      queue({ thumbnail: url });
    } catch (e) {
      setUploadError((e as Error).message);
    }
  }

  return (
    <>
      <article className="mx-auto flex w-full max-w-[705px] flex-col gap-8 pt-16">
        <div className="group/cover relative aspect-[310/475] w-[140px] border-[1.2px] border-black/5">
          <Image
            src={thumbnail}
            alt={`Cover of ${review.subjectTitle}`}
            fill
            sizes="140px"
            className="object-cover"
          />
          {editing && (
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-[12px] uppercase tracking-[1px] text-white opacity-0 transition group-hover/cover:bg-black/50 group-hover/cover:opacity-100">
              Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void replaceCover(f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        {editing && uploadError && (
          <p className="text-[13px] text-red-700">{uploadError}</p>
        )}
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-[32px] leading-[1.2] tracking-[-0.9px] sm:text-[40px]">
            <EditableText
              value={review.subjectTitle}
              editing={editing}
              onChange={(v) => queue({ subjectTitle: v })}
            />
            {kindHasCreator(kind) && (
              <>
                {" "}
                <i>{kind === "book" ? "by" : "dir."}</i>{" "}
                <EditableText
                  value={review.creator}
                  editing={editing}
                  onChange={(v) => queue({ creator: v })}
                  placeholder={kind === "book" ? "Author" : "Director"}
                />
              </>
            )}
          </h1>
          <p className="meta-caps flex items-center gap-2">
            {editing ? (
              // same text style as the rendered label; only the affordance differs
              <select
                value={kind}
                onChange={(e) => {
                  const next = e.target.value as ReviewKind;
                  setKind(next);
                  queue({ kind: next });
                }}
                className="meta-caps cursor-pointer border border-black/10 bg-transparent py-0.5"
              >
                {(Object.keys(KIND_LABEL) as ReviewKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            ) : (
              <span>{KIND_LABEL[kind]}</span>
            )}
            <span>
              · {formatDate(review.date)}
              {review.rating ? ` · ${"★".repeat(review.rating)}` : ""}
            </span>
          </p>
        </div>

        {editing ? (
          <BodyEditor
            bodyJson={review.bodyJson}
            reviewHtml={review.reviewHtml}
            docId={review.docId ?? "misc"}
            onChange={(bodyJson) => queue({ bodyJson })}
          />
        ) : bodyHtml ? (
          <div
            className="bn-container bn-editor text-[17px] leading-[30px] text-ink/90"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : review.reviewHtml ? (
          <div
            className="prose-review text-[17px] leading-[30px] text-ink/90"
            dangerouslySetInnerHTML={{ __html: review.reviewHtml }}
          />
        ) : (
          <p className="text-[17px] leading-[30px] text-ink-soft">
            {canEdit
              ? "No text yet — hit Edit below and start writing."
              : `No written review yet${review.rating ? ` — rated ${"★".repeat(review.rating)}` : ""}.`}
          </p>
        )}
      </article>

      {canEdit && (
        <EditToolbar
          editing={editing}
          saveState={saveState}
          status={status}
          onToggle={toggle}
          onPublishToggle={publishToggle}
          onDelete={remove}
          onSignOut={signOut}
        />
      )}
    </>
  );
}
