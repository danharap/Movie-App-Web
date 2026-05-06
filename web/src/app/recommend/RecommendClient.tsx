"use client";

import { STORAGE_KEY_LAST_RECOMMENDATION } from "@/config/brand";
import { TMDB_GENRE_OPTIONS } from "@/config/tmdbGenres";
import type { RecommendationInput } from "@/features/recommendations/schema";
import type { FinderMeta, RecommendedMovie } from "@/types/movie";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Canonical value sent to the API (normalized in engine via normalizeMoodKey). */
const VIBE_OPTIONS: { value: string; label: string }[] = [
  { value: "comforting", label: "Comforting" },
  { value: "cozy", label: "Cozy" },
  { value: "funny", label: "Funny" },
  { value: "romantic", label: "Romantic" },
  { value: "emotional", label: "Emotional" },
  { value: "intense", label: "Intense" },
  { value: "dark", label: "Dark" },
  { value: "weird", label: "Weird" },
  { value: "mind bending", label: "Mind-bending" },
  { value: "adventurous", label: "Adventurous" },
  { value: "epic", label: "Epic" },
  { value: "nostalgic", label: "Nostalgic" },
];

export function RecommendClient() {
  const router = useRouter();
  const [vibes, setVibes] = useState<string[]>(["comforting"]);
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

  function toggleVibe(value: string) {
    setVibes((prev) => {
      if (prev.includes(value)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== value);
      }
      if (prev.length >= 8) return prev;
      return [...prev, value];
    });
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
      vibes,
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
        finderMeta?: FinderMeta;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }
      if (!data.movies?.length) {
        throw new Error("No matches — try loosening filters.");
      }
      sessionStorage.setItem(
        STORAGE_KEY_LAST_RECOMMENDATION,
        JSON.stringify({ input: body, movies: data.movies, finderMeta: data.finderMeta }),
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
          What do you want to watch?
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
          A few honest inputs — we&apos;ll hand back a tight shortlist, not an
          endless catalog.
        </p>
      </header>

      <section className="reveal space-y-3" style={{ animationDelay: "0.05s" }}>
        <p className="text-sm font-medium text-zinc-300">Vibe</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Pick a mood. We&apos;ll find films that match it. Keep at least one selected.
        </p>
        <div className="flex flex-wrap gap-2">
          {VIBE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleVibe(value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                vibes.includes(value)
                  ? "border-amber-200/50 bg-amber-200/15 text-amber-50"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="reveal space-y-3" style={{ animationDelay: "0.12s" }}>
        <p className="text-sm font-medium text-zinc-300">Genres (optional)</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Optional. If you pick genres, results will be filtered strictly to those
          categories — ignoring your vibe selection above. Leave blank to let the
          vibe chips decide.
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
        className="reveal flex flex-col gap-2"
        style={{ animationDelay: "0.18s" }}
      >
        <ToggleOption
          checked={surpriseMe}
          onChange={setSurpriseMe}
          label="Mix it up"
          description="Randomly shifts the genre weighting so you don't always get the same type of result."
        />
        <ToggleOption
          checked={hiddenGem}
          onChange={setHiddenGem}
          label="Hidden gems only"
          description="Favours well-rated films that flew under the radar — less blockbuster, more discovery."
        />
        <ToggleOption
          checked={streamingOnly}
          onChange={setStreamingOnly}
          label="Available to stream"
          description="Only show films you can watch right now on a subscription service."
        />
        {streamingOnly ? (
          <div className="ml-14 mt-1">
            <label className="text-xs text-zinc-500">
              Your region (2-letter country code)
              <input
                value={watchRegion}
                onChange={(e) => setWatchRegion(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="e.g. US"
                className="ml-2 w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-amber-200/30"
              />
            </label>
          </div>
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

// ---------------------------------------------------------------------------
// Custom toggle option — replaces native checkboxes
// ---------------------------------------------------------------------------

function ToggleOption({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-start gap-4 rounded-xl border px-4 py-3 text-left transition ${
        checked
          ? "border-amber-200/30 bg-amber-200/8"
          : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      {/* Custom toggle pill */}
      <div
        className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
          checked ? "bg-amber-300" : "bg-zinc-700"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <div>
        <p className={`text-sm font-medium ${checked ? "text-amber-100" : "text-zinc-300"}`}>
          {label}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{description}</p>
      </div>
    </button>
  );
}
