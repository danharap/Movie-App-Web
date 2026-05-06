import { signOut } from "@/app/actions/auth";
import { APP_NAME } from "@/config/brand";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu } from "./MobileMenu";

const publicLinks = [
  { href: "/recommend", label: "Find a film" },
  { href: "/browse", label: "Browse" },
  { href: "/feedback", label: "Reviews" },
];

const authedLinks = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/watched", label: "Watched" },
  { href: "/friends", label: "Friends" },
  { href: "/import", label: "Import" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let displayName: string | null = null;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl = (profile?.avatar_url as string | null) ?? null;
    displayName =
      (profile?.display_name as string | null)?.trim() ||
      user.email?.split("@")[0] ||
      "Account";
    const role = (profile?.role as string | null) ?? "user";
    isAdmin = role === "admin" || role === "super_admin" || role === "moderator";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-white transition hover:opacity-90 sm:text-lg"
        >
          <span className="text-indigo-300">{APP_NAME}</span>
          <span className="hidden text-zinc-500 sm:inline"> — pick fast</span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          {user &&
            authedLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="ml-1 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop auth — hidden on mobile */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/[0.04]"
              >
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName ?? ""}
                      fill
                      className="object-cover"
                      sizes="28px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-300 select-none">
                      {(displayName ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="max-w-[120px] truncate text-sm font-medium text-zinc-200">
                  {displayName}
                </span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger — rendered by client component, hidden on desktop */}
        <MobileMenu
          user={user}
          avatarUrl={avatarUrl}
          displayName={displayName}
          isAdmin={isAdmin}
          publicLinks={publicLinks}
          authedLinks={authedLinks}
        />
      </div>
    </header>
  );
}
