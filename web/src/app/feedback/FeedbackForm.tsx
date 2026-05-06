"use client";

import { deleteAppFeedback, upsertAppFeedback } from "./actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AppFeedbackRow } from "@/features/feedback/schema";

type Props = {
  existing: AppFeedbackRow | null;
  /** Compact mode hides the outer card border — used when embedded inside another card */
  compact?: boolean;
};

const STARS = [1, 2, 3, 4, 5] as const;

export function FeedbackForm({ existing, compact = false }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [hovered, setHovered] = useState<number>(0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(!existing);

  if (!editing && existing) {
    return (
      <div className={compact ? "space-y-3" : "rounded-2xl border border-white/10 bg-zinc-900/40 p-5 space-y-3"}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-zinc-300">Your review</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-amber-200/80 hover:text-amber-100"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() =>
                startDeleteTransition(async () => {
                  setError(null);
                  try {
                    await deleteAppFeedback();
                    router.refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Delete failed");
                  }
                })
              }
              className="text-xs text-red-400/70 hover:text-red-300 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
        <div className="flex gap-0.5 text-amber-300">
          {STARS.map((s) => (
            <span key={s} className={s <= existing.rating ? "opacity-100" : "opacity-20"}>
              ★
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-zinc-400">{existing.body}</p>
        {error ? (
          <p className="text-xs text-red-300/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    startTransition(async () => {
      try {
        await upsertAppFeedback({ rating, body });
        setSuccess(existing ? "Review updated." : "Thanks for your feedback!");
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save review");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "space-y-4" : "rounded-2xl border border-white/10 bg-zinc-900/40 p-5 space-y-4"}
    >
      <p className="text-sm font-medium text-zinc-300">
        {existing ? "Update your review" : "Leave a review"}
      </p>

      {/* Star rating */}
      <div>
        <p className="mb-2 text-xs text-zinc-500">Rating (required)</p>
        <div
          className="flex gap-1"
          role="group"
          aria-label="Star rating"
          onMouseLeave={() => setHovered(0)}
        >
          {STARS.map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onClick={() => setRating(s)}
              aria-label={`${s} star${s > 1 ? "s" : ""}`}
              className={`text-2xl transition-colors ${
                s <= (hovered || rating) ? "text-amber-300" : "text-zinc-600"
              } hover:text-amber-200`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Review text */}
      <div className="space-y-1">
        <label htmlFor="feedback-body" className="text-xs text-zinc-500">
          Review (min 10 characters)
        </label>
        <textarea
          id="feedback-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share what you think about Nudge Film…"
          maxLength={2000}
          className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-200/30"
        />
        <p className="text-right text-xs text-zinc-600">{body.length}/2000</p>
      </div>

      {error ? (
        <p className="text-xs text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-xs text-emerald-400/90" role="status">
          {success}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-amber-200/90 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:opacity-60"
        >
          {isPending ? "Saving…" : existing ? "Update review" : "Submit review"}
        </button>
        {existing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setRating(existing.rating);
              setBody(existing.body);
              setError(null);
            }}
            className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
