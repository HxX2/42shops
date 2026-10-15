"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronsUpDown, CornerDownLeft, Loader2, Search } from "lucide-react";
import type { Campus, CountryGroup } from "@/lib/types";
import { campusCity, cn, normalize } from "@/lib/utils";

type Item = { campus: Campus; code: string; country: string };

export function CampusSwitcher({
  groups,
  current,
  open,
  onOpenChange,
}: {
  groups: CountryGroup[];
  current: Campus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  const filteredGroups = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return groups;
    return groups
      .map((g) =>
        normalize(g.country).includes(q)
          ? g
          : { ...g, campuses: g.campuses.filter((c) => normalize(`${c.name} ${c.city}`).includes(q)) },
      )
      .filter((g) => g.campuses.length);
  }, [groups, query]);

  const flat: Item[] = useMemo(
    () => filteredGroups.flatMap((g) => g.campuses.map((campus) => ({ campus, code: g.code, country: g.country }))),
    [filteredGroups],
  );

  // Global shortcut: Cmd/Ctrl + K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Reset when opening; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const idx = groups.flatMap((g) => g.campuses).findIndex((c) => c.id === current.id);
    setActive(Math.max(0, idx));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open, groups, current.id]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const select = (item: Item | undefined) => {
    if (!item) return;
    onOpenChange(false);
    if (item.campus.id === current.id) return;
    startTransition(() => router.push(`/shops/${item.campus.id}`));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  let index = -1;

  const palette = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="switcher"
          className="fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <motion.button
            aria-label="Close campus switcher"
            className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[3px]"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Switch campus"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_40px_80px_-24px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search size={18} className="shrink-0 text-muted" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Jump to a campus or country"
                className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted/80"
                role="combobox"
                aria-expanded="true"
                aria-controls="campus-switcher-list"
                aria-activedescendant={flat[active] ? `campus-opt-${flat[active].campus.id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted">esc</kbd>
            </div>

            <div ref={listRef} id="campus-switcher-list" role="listbox" className="max-h-[56vh] overflow-y-auto overscroll-contain p-2">
              {flat.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">No campus matches &ldquo;{query}&rdquo;.</p>
              ) : (
                filteredGroups.map((g) => (
                  <div key={g.country} className="mb-1">
                    <div className="sticky top-0 z-10 flex items-center gap-2 bg-white/95 px-3 pb-1.5 pt-3 text-xs text-muted backdrop-blur">
                      <span className="rounded-[4px] bg-ink px-1 py-0.5 font-pixel text-[9px] leading-none text-white">{g.code}</span>
                      {g.country}
                    </div>
                    {g.campuses.map((c) => {
                      index += 1;
                      const i = index;
                      const isActive = i === active;
                      const isCurrent = c.id === current.id;
                      return (
                        <button
                          key={c.id}
                          id={`campus-opt-${c.id}`}
                          role="option"
                          aria-selected={isActive}
                          data-index={i}
                          onMouseMove={() => active !== i && setActive(i)}
                          onClick={() => select({ campus: c, code: g.code, country: g.country })}
                          className="relative flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left"
                        >
                          {isActive ? (
                            <motion.span
                              layoutId="switcher-active"
                              transition={{ type: "spring", stiffness: 600, damping: 40 }}
                              className="absolute inset-0 rounded-xl bg-blue-wash"
                            />
                          ) : null}
                          <span className="relative min-w-0">
                            <span className={cn("block truncate text-[15px]", isActive && "text-blue")}>{c.name}</span>
                            {campusCity(c) ? <span className="block truncate text-xs text-muted">{campusCity(c)}</span> : null}
                          </span>
                          <span className="relative flex shrink-0 items-center gap-2 text-muted">
                            {isCurrent ? (
                              <span className="flex items-center gap-1 text-xs text-blue">
                                <Check size={14} /> Viewing
                              </span>
                            ) : isActive ? (
                              <CornerDownLeft size={14} className="text-blue" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-xs text-muted">
              <span>
                <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to move
              </span>
              <span>
                <kbd className="font-sans">↵</kbd> to open
              </span>
              <span className="ml-auto tabular">{flat.length} campuses</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onOpenChange(true)}
        className="group flex h-10 items-center gap-2.5 rounded-full border border-line bg-white pl-4 pr-2 text-sm transition-colors hover:border-ink"
        aria-haspopup="dialog"
      >
        {pending ? <Loader2 size={15} className="animate-spin text-blue" /> : <ChevronsUpDown size={15} className="text-muted" />}
        <span>Switch campus</span>
        <kbd className="hidden rounded-full bg-wash px-2 py-0.5 text-[11px] text-muted transition-colors group-hover:bg-ink group-hover:text-white sm:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </motion.button>
      {mounted ? createPortal(palette, document.body) : null}
    </>
  );
}
