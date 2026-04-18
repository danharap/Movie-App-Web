"use server";

import { addToWatchlist, markWatched } from "@/app/actions/library";

export async function markSeenFromForm(formData: FormData) {
  const tmdbId = Number(formData.get("tmdbId"));
  if (!Number.isFinite(tmdbId)) return;
  await markWatched(tmdbId);
}

export async function queueFilmFromForm(formData: FormData) {
  const tmdbId = Number(formData.get("tmdbId"));
  if (!Number.isFinite(tmdbId)) return;
  await addToWatchlist(tmdbId);
}
