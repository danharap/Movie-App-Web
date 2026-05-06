import { signOut } from "@/app/actions/auth";
import { APP_NAME } from "@/config/brand";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

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

  // Fetch profile for avatar + display name
  let avatarUrl: string | null = null;
  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl = (profile?.avatar_url as string | null) ?? null;
    displayName =
      (profile?.display_name as string | null)?.trim() ||
      user.email?.split("@")[0] ||
      "Account";
  }

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
              {/* Profile avatar + name — clicking goes to /profile */}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/5"
              >
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-700 ring-1 ring-white/15">
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
                    <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-200 select-none">
                      {(displayName ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-zinc-200 md:block">
                  {displayName}
                </span>
              </Link>

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
