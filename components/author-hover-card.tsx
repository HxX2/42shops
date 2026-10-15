"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const AUTHOR = {
  name: "HxX",
  subtitle: "1337 Morocco",
  avatarUrl: "https://github.com/HxX2.png",
  htmlUrl: "https://github.com/HxX2",
};

function GithubIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function AuthorHoverCard() {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="relative inline-flex items-center align-middle mx-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={AUTHOR.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink transition-all hover:border-ink hover:bg-ink hover:text-white"
        aria-label="Author GitHub profile: @HxX"
      >
        <span>@{AUTHOR.name}</span>
      </a>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12, rotate: -2 }}
            transition={{ type: "spring", stiffness: 480, damping: 28 }}
            className="pointer-events-auto absolute bottom-full mb-3 left-0 sm:left-auto sm:right-0 z-50 w-68 sm:w-72 max-w-[calc(100vw-2.5rem)] rounded-[22px] border border-line bg-white p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.05)]"
          >
            {/* Header: Avatar + Info on Right, and GitHub logo on far right */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={AUTHOR.avatarUrl}
                  alt={AUTHOR.name}
                  className="h-12 w-12 shrink-0 rounded-full border border-line bg-wash object-cover shadow-xs"
                  loading="eager"
                />
                <div className="min-w-0">
                  <h4 className="truncate font-pixel text-[13px] leading-tight text-ink">
                    {AUTHOR.name}
                  </h4>
                  <p className="mt-1 truncate text-xs text-muted">
                    {AUTHOR.subtitle}
                  </p>
                </div>
              </div>

              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-wash text-ink shadow-2xs">
                <GithubIcon size={16} />
              </span>
            </div>

            {/* View Profile CTA */}
            <a
              href={AUTHOR.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex items-center justify-between rounded-full bg-ink px-4 py-2 text-xs font-medium text-white transition-all hover:bg-blue active:scale-98"
            >
              <span>View profile</span>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 transition-transform duration-200 group-hover:scale-110 group-hover:bg-white group-hover:text-blue">
                <ArrowUpRight size={13} />
              </span>
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
