"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ExternalLink, LogOut } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { Brand } from "./brand";
import { PixelArt } from "./pixel-art";
import { useDismiss } from "./use-dismiss";

type User = { login: string; displayName: string; image: string | null };

function WalletPill({ wallet }: { wallet: number }) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2 pr-3.5"
      title="Your 42 wallet"
    >
      <motion.span
        variants={{ rest: { rotateY: 0 }, hover: { rotateY: 360, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}
        className="flex"
      >
        <PixelArt sprite="coin" scale={2} />
      </motion.span>
      <span className="font-pixel text-[13px] leading-none">
        ₳ <AnimatedNumber value={wallet} className="tabular" />
      </span>
      <span className="sr-only">in your wallet</span>
    </motion.div>
  );
}

function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, ref, close);

  const showImage = Boolean(user.image && !imgError);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5 text-sm transition-colors hover:border-ink"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image!}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-wash text-xs font-medium uppercase text-ink">
            {user.login.slice(0, 2)}
          </span>
        )}
        <span className="hidden sm:inline">{user.login}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
          <ChevronDown size={14} className="text-muted" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-line bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center gap-2.5 px-3 pb-2.5 pt-2">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image!} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-wash text-xs font-medium uppercase text-ink shrink-0">
                  {user.login.slice(0, 2)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.displayName}</p>
                <p className="truncate text-xs text-muted">{user.login}</p>
              </div>
            </div>
            <div className="h-px bg-line" />
            <a
              role="menuitem"
              href={`https://profile.intra.42.fr/users/${encodeURIComponent(user.login)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-wash"
            >
              Open intra profile
              <ExternalLink size={14} className="text-muted" />
            </a>
            <form action="/api/auth/logout" method="post">
              <button
                role="menuitem"
                type="submit"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-heart transition-colors hover:bg-heart/8"
              >
                Sign out
                <LogOut size={14} />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function AppHeader({ user, wallet }: { user: User; wallet: number }) {
  return (
    <header className="relative z-40 flex items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-6">
      <Brand href="/shops" />
      <div className="flex items-center gap-2">
        <WalletPill wallet={wallet} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
