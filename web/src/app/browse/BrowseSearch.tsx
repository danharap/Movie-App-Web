"use client";

import { addTVToWatchlist, addToWatchlist, markTVWatched, markWatched } from "@/app/actions/library";
import { posterUrl } from "@/lib/tmdb/constants";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

type Hit = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  mediaType?: "movie" | "tv";
};

type SearchType = "movies" | "tv" | "all";

export function BrowseSearch({
  isLoggedIn,
  type = "all",
}: {
  isLoggedIn: boolean;
  type?: SearchType;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholder =
    type === "tv" ? "Search any TV show by title…" :
    type === "movies" ? "Search any film by title…" :
    "Search films and TV shows…";

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `/api/movies/search?q=${encodeURIComponent(q)}&type=${type}`;
        const res = await fetch(url, { credentials: "same-origin" });
        const data = (await res.json()) as { results?: Hit[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.results ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [type],
  );

  useEffect(() => {
    void runSearch(debounced);
  }, [debounced, runSearch]);

  function act(id: number, action: () => Promise<void>, msg: string) {
    if (!isLoggedIn) {
      toast.error("Sign in to save.");
      return;
    }
    startTransition(async () => {
      try {
        await action();
        toast.success(msg);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error");
      }
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
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
                const isTV = m.mediaType === "tv";
                const href = isTV ? `/show/${m.id}` : `/movie/${m.id}`;
                return (
                  <li key={`${m.mediaType ?? "movie"}-${m.id}`} className="flex items-center gap-3 px-3 py-3">
                    <Link href={href} className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
                      {poster ? (
                        <Image src={poster} alt="" fill className="object-cover" sizes="40px" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={href}
                          className="truncate text-sm font-medium text-white hover:text-indigo-200 block"
                        >
                          {m.title}
                        </Link>
                        {isTV && (
                          <span className="shrink-0 rounded bg-violet-600/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            TV
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {year} · ★ {m.vote_average?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          act(
                            m.id,
                            () => (isTV ? markTVWatched(m.id) : markWatched(m.id)),
                            "Added to diary.",
                          )
                        }
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        Watched
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          act(
                            m.id,
                            () =>
                              isTV ? addTVToWatchlist(m.id) : addToWatchlist(m.id),
                            "Added to watchlist.",
                          )
                        }
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
