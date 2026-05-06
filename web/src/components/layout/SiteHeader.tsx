import { signOut } from "@/app/actions/auth";
import { APP_NAME } from "@/config/brand";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const publicLinks = [
  { href: "/recommend", label: "Find a film" },
  { href: "/browse", label: "Browse" },
];

const authedLinks = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/watched", label: "Watched" },
  { href: "/friends", label: "Friends" },
  { href: "/profile", label: "Profile" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-white sm:text-xl"
        >
          <span className="text-amber-200/90">{APP_NAME}</span>
          <span className="text-zinc-400"> — pick fast</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 sm:flex-1 sm:justify-center">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white sm:text-sm"
            >
              {l.label}
            </Link>
          ))}
          {user
            ? authedLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white sm:text-sm"
                >
                  {l.label}
                </Link>
              ))
            : null}
        </nav>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-xs text-zinc-500 md:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-amber-200/40 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm text-zinc-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-amber-200/90 px-3 py-1.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
