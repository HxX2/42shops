"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismiss } from "./use-dismiss";

const pillSpring = { type: "spring", stiffness: 520, damping: 38 } as const;

export function Segmented<T extends string>({
  id,
  value,
  onChange,
  options,
  label,
}: {
  id: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; count?: number }>;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex overflow-x-auto rounded-full bg-wash p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`${id}-pill`}
                transition={pillSpring}
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]"
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {typeof o.count === "number" ? (
                <motion.span
                  key={o.count}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("text-xs tabular", active ? "text-blue" : "text-muted/70")}
                >
                  {o.count}
                </motion.span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SortMenu<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<T | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);
  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-white pl-4 pr-3 text-sm transition-colors hover:border-ink"
      >
        <span className="text-muted">Sort</span>
        <span className="font-medium">{current?.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={pillSpring}>
          <ChevronDown size={14} className="text-muted" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ transformOrigin: "top right" }}
            onMouseLeave={() => setHovered(null)}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-2xl border border-line bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]"
          >
            {options.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  onMouseEnter={() => setHovered(o.value)}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm"
                >
                  {hovered === o.value ? (
                    <motion.span layoutId="sort-hover" transition={pillSpring} className="absolute inset-0 rounded-xl bg-wash" />
                  ) : null}
                  <span className="relative">{o.label}</span>
                  {o.value === value ? <Check size={14} className="relative text-blue" /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
