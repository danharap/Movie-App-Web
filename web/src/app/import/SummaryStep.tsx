"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Film, List, XCircle, Loader2, AlertCircle, Heart } from "lucide-react";
import type { MatchedData } from "./MatchingStep";
import type { SaveResponseBody } from "@/app/api/import/save/route";

interface SummaryStepProps {
  matchedData: MatchedData;
  onStartOver: () => void;
}

type SavePhase = "saving" | "done" | "error";

export function SummaryStep({ matchedData, onStartOver }: SummaryStepProps) {
  const [phase, setPhase] = useState<SavePhase>("saving");
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveResult, setSaveResult] = useState<SaveResponseBody | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const runSave = async () => {
      // Animate progress while saving
      const total = matchedData.watched.length + matchedData.watchlist.length;
      setSaveProgress(0);

      const progressInterval = setInterval(() => {
        setSaveProgress((p) => Math.min(p + Math.ceil(total / 20), total - 1));
      }, 200);

      try {
        const res = await fetch("/api/import/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            watched: matchedData.watched,
            watchlist: matchedData.watchlist,
          }),
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          throw new Error(`Save failed: ${res.statusText}`);
        }

        const result: SaveResponseBody = await res.json();
        setSaveProgress(total);
        setSaveResult(result);
        setPhase("done");
      } catch (err) {
        clearInterval(progressInterval);
        setSaveError(err instanceof Error ? err.message : "Import failed");
        setPhase("error");
        hasSaved.current = false;
      }
    };

    runSave();
  }, [matchedData]);

  // ── Saving progress UI ─────────────────────────────────────────────────────
  if (phase === "saving") {
    const total = matchedData.watched.length + matchedData.watchlist.length;
    const pct = total > 0 ? Math.round((saveProgress / total) * 100) : 0;

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-300" />
          <div className="text-center">
            <p className="text-lg font-medium text-white">Saving your library…</p>
            <p className="mt-1 text-sm text-zinc-400">
              Adding {matchedData.watched.length} films to your watched history and{" "}
              {matchedData.watchlist.length} to your watchlist
            </p>
          </div>
        </div>
        <div className="w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-amber-300 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Error UI ───────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-8">
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 w-full">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="font-medium text-red-300">Import failed</p>
            <p className="mt-0.5 text-sm text-red-400/80">{saveError}</p>
          </div>
        </div>
        <button
          onClick={() => {
            hasSaved.current = false;
            setPhase("saving");
            setSaveError(null);
          }}
          className="rounded-full bg-white/10 px-6 py-2.5 text-sm text-white hover:bg-white/15 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Done UI ────────────────────────────────────────────────────────────────
  const r = saveResult!;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Import complete!</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Your Letterboxd history has been added to your library.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Film className="h-5 w-5 text-amber-300" />}
          value={r.watchedImported}
          label="Films imported"
          highlight
        />
        <StatCard
          icon={<List className="h-5 w-5 text-zinc-400" />}
          value={r.watchlistImported}
          label="Watchlist added"
        />
        {matchedData.skippedCount > 0 && (
          <StatCard
            icon={<XCircle className="h-5 w-5 text-zinc-600" />}
            value={matchedData.skippedCount}
            label="Skipped"
          />
        )}
        {matchedData.likedFilmTitles.length > 0 && (
          <StatCard
            icon={<Heart className="h-5 w-5 text-rose-400" />}
            value={matchedData.likedFilmTitles.length}
            label="Liked films found"
          />
        )}
      </div>

      {/* Errors (non-fatal) */}
      {r.errors && r.errors.length > 0 && (
        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400">
            {r.errors.length} films couldn&apos;t be saved (click to expand)
          </summary>
          <ul className="mt-3 space-y-1">
            {r.errors.slice(0, 20).map((e, i) => (
              <li key={i} className="text-xs text-zinc-600">
                {e}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Liked films note */}
      {matchedData.likedFilmTitles.length > 0 && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/15 p-4 text-sm text-rose-300">
          <strong>Liked films tip:</strong> You had {matchedData.likedFilmTitles.length} liked
          films on Letterboxd. Visit your{" "}
          <Link href="/profile" className="underline hover:text-rose-200">
            profile
          </Link>{" "}
          to pin up to 4 as your favourites.
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/watched"
          className="flex-1 rounded-full bg-amber-200/90 px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
        >
          View my watched films →
        </Link>
        <Link
          href="/watchlist"
          className="flex-1 rounded-full bg-white/10 px-6 py-3 text-center text-sm text-white transition hover:bg-white/15"
        >
          View watchlist
        </Link>
      </div>

      <button
        onClick={onStartOver}
        className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition"
      >
        Start a new import
      </button>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center ${
        highlight ? "bg-amber-300/10 ring-1 ring-amber-300/20" : "bg-white/5"
      }`}
    >
      {icon}
      <div className={`text-2xl font-bold ${highlight ? "text-amber-300" : "text-white"}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}
