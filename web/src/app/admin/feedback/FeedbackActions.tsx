"use client";

import { deleteFeedback } from "@/app/actions/admin";
import { useTransition } from "react";

export function DeleteFeedbackButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this review?")) return;
        startTransition(() => deleteFeedback(id));
      }}
      className="rounded-full border border-red-900/40 px-3 py-1 text-xs text-red-400 hover:bg-red-900/20 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
