"use client";

import { signOut } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

type Props = {
  user: { id: string } | null;
  avatarUrl: string | null;
  displayName: string | null;
  isAdmin: boolean;
  publicLinks: NavLink[];
  authedLinks: NavLink[];
};

export function MobileMenu({ user, avatarUrl, displayName, isAdmin, publicLinks, authedLinks }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const allLinks = [...publicLinks, ...(user ? authedLinks : [])];

  return (
    <>
      {/* Hamburger button — only visible on mobile */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:text-white md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-drawer"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <path d="M1.5 3.5h12M1.5 7.5h12M1.5 11.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          style={{ animation: "fadeInBackdrop 0.2s ease forwards" }}
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer — fully opaque so content behind doesn't bleed through */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(80vw,300px)] flex-col border-l border-white/[0.08] bg-[#09090b] shadow-2xl shadow-black/80 transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-300"
            onClick={() => setOpen(false)}
          >
            Nudge Film
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:text-white"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-2">
          <div className="space-y-0.5">
            {allLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium transition ${
                  pathname === l.href
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-white/[0.08]" />
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl bg-indigo-500/10 px-4 py-3.5 text-[15px] font-medium text-indigo-300 transition hover:bg-indigo-500/20"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/20 text-[10px]">⚡</span>
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Footer auth section */}
        <div className="border-t border-white/[0.08] p-4">
          {user ? (
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? ""}
                      fill
                      className="object-cover"
                      sizes="36px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-bold text-indigo-300 select-none">
                      {(displayName ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-zinc-500">View profile →</p>
                </div>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-white/10 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
