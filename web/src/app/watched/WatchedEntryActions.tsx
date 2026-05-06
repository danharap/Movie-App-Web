"use client";

import { markWatched } from "@/app/actions/library";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  tmdbId: number;
  initialRating: number | null;
  initialNotes: string | null;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function WatchedEntryActions({ tmdbId, initialRating, initialNotes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState<number>(initialRating ?? 0);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"ok" | "err">("ok");

  function flash(msg: string, kind: "ok" | "err" = "ok") {
    setMessage(msg);
    setMessageKind(kind);
    setTimeout(() => setMessage(null), 3000);
  }

  function onSave() {
    startTransition(async () => {
      try {
        await markWatched(tmdbId, rating > 0 ? rating : null, notes.trim() || null);
        setEditing(false);
        flash("Updated.");
        router.refresh();
      } catch (e) {
        flash(e instanceof Error ? e.message : "Could not save.", "err");
      }
    });
  }

  if (!editing) {
    return (
      <div className="mt-2 space-y-1">
        {message ? (
          <p
            className={`text-xs ${messageKind === "ok" ? "text-emerald-400/90" : "text-red-300/90"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          {initialRating ? `Rated ${initialRating}/10 · Edit` : "Add rating / notes"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <div>
        <p className="mb-1.5 text-xs text-zinc-500">Rating (tap to toggle)</p>
        <div className="flex flex-wrap gap-1.5">
          {RATING_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating((prev) => (prev === n ? 0 : n))}
              className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                rating === n
                  ? "border-amber-200/50 bg-amber-200/15 text-amber-100"
                  : "border-white/10 text-zinc-600 hover:border-white/25 hover:text-zinc-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes…"
        className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600 focus:ring-1 focus:ring-amber-200/30"
      />

      {message ? (
        <p
          className={`text-xs ${messageKind === "ok" ? "text-emerald-400/90" : "text-red-300/90"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={onSave}
          className="rounded-full bg-amber-200/90 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setRating(initialRating ?? 0);
            setNotes(initialNotes ?? "");
          }}
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
