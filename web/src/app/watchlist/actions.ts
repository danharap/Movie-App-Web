"use server";

import { removeFromWatchlist } from "@/app/actions/library";

export async function removeWatchlistItem(formData: FormData) {
  const tmdbId = Number(formData.get("tmdbId"));
  if (!Number.isFinite(tmdbId)) return;
  await removeFromWatchlist(tmdbId);
}
