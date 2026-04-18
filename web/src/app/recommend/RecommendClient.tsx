"use client";

import { TMDB_GENRE_OPTIONS } from "@/config/tmdbGenres";
import type { RecommendationInput } from "@/features/recommendations/schema";
import type { RecommendedMovie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useState } from "react";

const MOOD_PRESETS = [
  "comforting",
  "intense",
  "emotional",
  "funny",
  "dark",
  "mind bending",
  "adventurous",
  "nostalgic",
];

const TONE_CHIPS = [
  "funny",
  "dark",
  "intense",
  "comforting",
  "emotional",
  "weird",
  "romantic",
  "epic",
];

const STORAGE_KEY = "tonight:lastRecommendation";

export function RecommendClient() {
  const router = useRouter();
  const [mood, setMood] = useState("comforting");
  const [tone, setTone] = useState<string[]>([]);
  const [genres, setGenres] = useState<number[]>([]);
  const [runtimeMin, setRuntimeMin] = useState("");
  const [runtimeMax, setRuntimeMax] = useState("");
  const [minVote, setMinVote] = useState("6.5");
  const [eraMin, setEraMin] = useState("");
  const [eraMax, setEraMax] = useState("");
  const [language, setLanguage] = useState("");
  const [surpriseMe, setSurpriseMe] = useState(false);
  const [hiddenGem, setHiddenGem] = useState(false);
  const [streamingOnly, setStreamingOnly] = useState(false);
  const [watchRegion, setWatchRegion] = useState("US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTone(t: string) {
    setTone((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  function toggleGenre(id: number) {
    setGenres((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const body: RecommendationInput = {
      mood,
      tone,
      genres,
      surpriseMe,
      hiddenGem,
      streamingOnly,
      watchRegion: streamingOnly ? watchRegion : undefined,
      minVoteAverage: Number(minVote) || 6,
      runtimeMin: runtimeMin ? Number(runtimeMin) : undefined,
      runtimeMax: runtimeMax ? Number(runtimeMax) : undefined,
      eraMinYear: eraMin ? Number(eraMin) : undefined,
      eraMaxYear: eraMax ? Number(eraMax) : undefined,
      language: language || undefined,
    };

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        movies?: RecommendedMovie[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      if (!data.movies?.length) {
        throw new Error("No matches — try loosening filters.");
      }
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ input: body, movies: data.movies }),
      );
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6"
    >
      <header className="reveal space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-200/70">
          Step by step
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          How do you want to feel tonight?
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
          A few honest inputs — we&apos;ll hand back a tight shortlist, not an
          endless catalog.
        </p>
      </header>

      <section className="reveal space-y-3" style={{ animationDelay: "0.05s" }}>
        <label className="text-sm font-medium text-zinc-300" htmlFor="mood">
          Mood
        </label>
        <input
          id="mood"
          name="mood"
          list="mood-presets"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-amber-200/30 placeholder:text-zinc-600 focus:ring-2"
          placeholder="e.g. comforting, intense…"
        />
        <datalist id="mood-presets">
          {MOOD_PRESETS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </section>

      <section className="reveal space-y-3" style={{ animationDelay: "0.1s" }}>
        <p className="text-sm font-medium text-zinc-300">Tone (optional)</p>
        <div className="flex flex-wrap gap-2">
          {TONE_CHIPS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTone(t)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                tone.includes(t)
                  ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="reveal space-y-3" style={{ animationDelay: "0.12s" }}>
        <p className="text-sm font-medium text-zinc-300">
          Genres you&apos;re open to
        </p>
        <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
          {TMDB_GENRE_OPTIONS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => toggleGenre(g.id)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                genres.includes(g.id)
                  ? "border-amber-200/50 bg-amber-200/10 text-amber-50"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </section>

      <section
        className="reveal grid gap-4 sm:grid-cols-2"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="rtmin">
            Min runtime (min)
          </label>
          <input
            id="rtmin"
            inputMode="numeric"
            value={runtimeMin}
            onChange={(e) => setRuntimeMin(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            placeholder="e.g. 90"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="rtmax">
            Max runtime (min)
          </label>
          <input
            id="rtmax"
            inputMode="numeric"
            value={runtimeMax}
            onChange={(e) => setRuntimeMax(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            placeholder="e.g. 130"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="vote">
            Minimum TMDb rating
          </label>
          <input
            id="vote"
            type="number"
            step="0.1"
            min={0}
            max={10}
            value={minVote}
            onChange={(e) => setMinVote(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="lang">
            Original language (ISO)
          </label>
          <input
            id="lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            placeholder="e.g. en"
            maxLength={2}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="eraMin">
            Release from year
          </label>
          <input
            id="eraMin"
            inputMode="numeric"
            value={eraMin}
            onChange={(e) => setEraMin(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            placeholder="e.g. 1990"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400" htmlFor="eraMax">
            Release through year
          </label>
          <input
            id="eraMax"
            inputMode="numeric"
            value={eraMax}
            onChange={(e) => setEraMax(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-200/30"
            placeholder="e.g. 2024"
          />
        </div>
      </section>

      <section
        className="reveal flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        style={{ animationDelay: "0.18s" }}
      >
        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={surpriseMe}
            onChange={(e) => setSurpriseMe(e.target.checked)}
            className="size-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-amber-200/40"
          />
          Surprise me (shuffle genre emphasis)
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={hiddenGem}
            onChange={(e) => setHiddenGem(e.target.checked)}
            className="size-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-amber-200/40"
          />
          Prefer hidden gems (strong votes vs. hype)
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={streamingOnly}
            onChange={(e) => setStreamingOnly(e.target.checked)}
            className="size-4 rounded border-white/20 bg-black/40 text-amber-400 focus:ring-amber-200/40"
          />
          Streaming-friendly (subscription, TMDb providers)
        </label>
        {streamingOnly ? (
          <label className="text-sm text-zinc-400">
            Region{" "}
            <input
              value={watchRegion}
              onChange={(e) => setWatchRegion(e.target.value.toUpperCase())}
              maxLength={2}
              className="ml-2 w-16 rounded border border-white/10 bg-black/30 px-2 py-1 text-white"
            />
          </label>
        ) : null}
      </section>

      {error ? (
        <p className="text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="reveal w-full rounded-2xl bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 px-6 py-4 text-center text-base font-semibold text-zinc-950 shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
        style={{ animationDelay: "0.22s" }}
      >
        {loading ? "Finding films…" : "Curate my shortlist"}
      </button>
    </form>
  );
}
