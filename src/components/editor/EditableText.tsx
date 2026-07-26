"use client";

import { useRef } from "react";

/**
 * The core in-place primitive. THE RULE: same element, same className in
 * both modes — only contentEditable flips. Never swap for an <input>.
 */
export function EditableText({
  as: Tag = "span",
  value,
  editing,
  onChange,
  className = "",
  placeholder,
}: {
  as?: "span" | "h1" | "h2" | "h3" | "p" | "i";
  value: string;
  editing: boolean;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
}) {
  // Uncontrolled while editing: React never rewrites the node under the
  // caret. The initial value is set once via ref; edits flow out only.
  const last = useRef(value);

  return (
    <Tag
      className={`${className} ${
        editing
          ? "outline-1 outline-dashed outline-black/20 focus:outline-black/50 min-w-[1ch]"
          : ""
      }`}
      contentEditable={editing}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={(e) => {
        last.current = (e.target as HTMLElement).innerText;
        onChange(last.current);
      }}
      onBlur={(e) => {
        const text = (e.target as HTMLElement).innerText.trim();
        if (text !== last.current) onChange(text);
      }}
    >
      {value}
    </Tag>
  );
}
