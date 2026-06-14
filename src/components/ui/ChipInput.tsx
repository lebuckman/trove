"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ChipInput({
  label,
  values,
  onChange,
  suggestions = [],
  placeholder = "add tag…",
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  /** Existing tag names — surfaced as quick-add suggestions. */
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const lowerValues = new Set(values.map((v) => v.toLowerCase()));
  const filteredSuggestions = suggestions
    .filter((s) => !lowerValues.has(s.toLowerCase()))
    .filter((s) => (draft ? s.toLowerCase().includes(draft.toLowerCase()) : true))
    .slice(0, 6);

  function commit(raw: string) {
    const v = raw.trim().toLowerCase().replace(/^#/, "");
    if (!v) return;
    if (lowerValues.has(v)) return;
    onChange([...values, v]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft.length === 0 && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <span className="mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle">
        {label}
      </span>
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-surface-2/60 px-3 py-2.5"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence initial={false}>
          {values.map((v) => (
            <motion.span
              key={v}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="inline-flex items-center gap-1 rounded-chip border border-accent/30 bg-accent-soft px-2.5 py-1 text-[12.5px] font-medium lowercase text-accent"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="-mr-1 ml-0.5 leading-none"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[80px] flex-1 bg-transparent py-1 text-[16px] text-text outline-none placeholder:text-text-subtle"
        />
      </div>
      {filteredSuggestions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className={cn(
                "tappable rounded-chip border border-border bg-surface-2/40 px-2.5 py-1 text-[11.5px] text-text-muted",
                "hover:text-text",
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
