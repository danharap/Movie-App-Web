"use client";

import { addToWatchlist, markWatched } from "@/app/actions/library";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type Hit = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
};

export function BrowseSearch({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/movies/search?q=${encodeURIComponent(q)}`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as { results?: Hit[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runSearch(debounced);
  }, [debounced, runSearch]);

  function act(
    movieId: number,
    action: () => Promise<void>,
    msg: string,
  ) {
    if (!isLoggedIn) {
      setActionMsg((p) => ({ ...p, [movieId]: "Sign in to save." }));
      return;
    }
    startTransition(async () => {
      try {
        await action();
        setActionMsg((p) => ({ ...p, [movieId]: msg }));
      } catch (e) {
        setActionMsg((p) => ({
          ...p,
          [movieId]: e instanceof Error ? e.message : "Error",
        }));
      }
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search any film by title…"
        autoComplete="off"
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-400/25"
      />

      {(results.length > 0 || loading || error) && debounced.length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[28rem] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/50">
          {loading ? (
            <p className="px-4 py-3 text-xs text-zinc-500">Searching…</p>
          ) : error ? (
            <p className="px-4 py-3 text-xs text-red-300/80">{error}</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {results.map((m) => {
                const year = m.release_date?.slice(0, 4) ?? "—";
                const poster = posterUrl(m.poster_path, "w92");
                const msg = actionMsg[m.id];
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    <Link href={`/movie/${m.id}`} className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                      {poster ? (
                        <Image src={poster} alt="" fill className="object-cover" sizes="40px" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/movie/${m.id}`} className="truncate text-sm font-medium text-white hover:text-indigo-200 block">
                        {m.title}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {year} · ★ {m.vote_average?.toFixed(1) ?? "—"}
                      </p>
                      {msg ? <p className="text-xs text-zinc-400">{msg}</p> : null}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => act(m.id, () => markWatched(m.id), "Logged ✓")}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        Watched
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => act(m.id, () => addToWatchlist(m.id), "Queued ✓")}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        + List
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
