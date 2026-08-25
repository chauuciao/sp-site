"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apple-Books-style reading preferences for article pages: text size,
 * body font, and reading theme. Persisted per-browser; applied as CSS
 * vars on #reader-surface so the whole reading area re-themes.
 */
interface Prefs {
  scale: number;
  font: "sans" | "serif";
  theme: string;
}

const SCALES = [0.85, 1, 1.15, 1.3];
const DEFAULTS: Prefs = { scale: 1, font: "sans", theme: "original" };
const KEY = "sp:reader";

const THEMES: Record<string, { label: string; bg: string; ink: string }> = {
  original: { label: "Original", bg: "#f8f8f6", ink: "#050505" },
  quiet: { label: "Quiet", bg: "#2a2a28", ink: "#ececea" },
  paper: { label: "Paper", bg: "#ffffff", ink: "#1a1a1a" },
  calm: { label: "Calm", bg: "#e9dcc3", ink: "#2a2317" },
  focus: { label: "Focus", bg: "#fbf6ec", ink: "#141414" },
};

function apply(p: Prefs) {
  const el = document.getElementById("reader-surface");
  if (!el) return;
  const t = THEMES[p.theme] ?? THEMES.original;
  el.style.setProperty("--reader-bg", t.bg);
  el.style.setProperty("--reader-ink", t.ink);
  el.style.setProperty("--reader-scale", String(p.scale));
  el.style.setProperty(
    "--reader-font",
    p.font === "serif" ? "var(--font-serif)" : "var(--font-sans)",
  );
}

export function ReaderSettings() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? "null") as Prefs | null;
      if (stored) {
        setPrefs(stored);
        apply(stored);
      }
    } catch {
      /* corrupted prefs: fall back to defaults */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  function update(next: Partial<Prefs>) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    apply(merged);
    localStorage.setItem(KEY, JSON.stringify(merged));
  }

  const scaleIdx = SCALES.indexOf(prefs.scale);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Reading settings"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="cursor-pointer border border-black/10 bg-white/60 px-3 py-1.5 font-serif text-[15px] leading-none text-[#141414] hover:bg-white"
      >
        Aa
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 flex w-[280px] flex-col gap-4 border border-black/10 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[1px] text-black/50">
              Text size
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Smaller text"
                disabled={scaleIdx <= 0}
                onClick={() => update({ scale: SCALES[Math.max(0, scaleIdx - 1)] })}
                className="cursor-pointer border border-black/10 px-3 py-1 text-[13px] text-[#141414] hover:bg-black/5 disabled:opacity-30"
              >
                A−
              </button>
              <button
                type="button"
                aria-label="Larger text"
                disabled={scaleIdx >= SCALES.length - 1}
                onClick={() =>
                  update({ scale: SCALES[Math.min(SCALES.length - 1, scaleIdx + 1)] })
                }
                className="cursor-pointer border border-black/10 px-3 py-1 text-[17px] text-[#141414] hover:bg-black/5 disabled:opacity-30"
              >
                A+
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[1px] text-black/50">
              Font
            </span>
            <div className="flex gap-1">
              {(["sans", "serif"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => update({ font: f })}
                  className={`cursor-pointer border px-3 py-1 text-[13px] text-[#141414] hover:bg-black/5 ${
                    prefs.font === f ? "border-black/60" : "border-black/10"
                  } ${f === "serif" ? "font-serif" : ""}`}
                >
                  {f === "sans" ? "Sans" : "Serif"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[1px] text-black/50">
              Theme
            </span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update({ theme: key })}
                  className={`flex cursor-pointer flex-col items-center gap-1 border px-2 py-2 ${
                    prefs.theme === key ? "border-black/60" : "border-black/10"
                  }`}
                  style={{ backgroundColor: t.bg }}
                >
                  <span className="font-serif text-[15px]" style={{ color: t.ink }}>
                    Aa
                  </span>
                  <span className="text-[10px]" style={{ color: t.ink }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
