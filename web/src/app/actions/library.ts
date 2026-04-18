"use server";

import { getMovieDetails } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function ensureMovieRow(tmdbId: number): Promise<number> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (existing?.id) return Number(existing.id);

  const d = await getMovieDetails(tmdbId);
  const year =
    d.release_date && d.release_date.length >= 4
      ? Number(d.release_date.slice(0, 4))
      : null;

  const row = {
    tmdb_id: tmdbId,
    title: d.title,
    release_year: Number.isFinite(year) ? year : null,
    poster_path: d.poster_path,
    backdrop_path: d.backdrop_path,
    overview: d.overview,
    runtime: d.runtime,
    vote_average: d.vote_average,
    genres: d.genres,
  };

  const { data, error } = await supabase
    .from("movies")
    .upsert(row, { onConflict: "tmdb_id" })
    .select("id")
    .single();

  if (error) throw error;
  return Number(data.id);
}

export async function markWatched(
  tmdbId: number,
  rating?: number | null,
  notes?: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to save your watch history.");

  const movieId = await ensureMovieRow(tmdbId);
  const { error } = await supabase.from("watched_movies").upsert(
    {
      user_id: user.id,
      movie_id: movieId,
      user_rating: rating ?? null,
      notes: notes ?? null,
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,movie_id" },
  );
  if (error) throw error;
  revalidatePath("/watched");
  revalidatePath("/watchlist");
  revalidatePath("/results");
}

export async function addToWatchlist(tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to use your watchlist.");

  const movieId = await ensureMovieRow(tmdbId);
  const { error } = await supabase.from("watchlist").upsert(
    {
      user_id: user.id,
      movie_id: movieId,
    },
    { onConflict: "user_id,movie_id" },
  );
  if (error) throw error;
  revalidatePath("/watchlist");
}

export async function removeFromWatchlist(tmdbId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: movie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (!movie?.id) return;

  await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.id)
    .eq("movie_id", movie.id);
  revalidatePath("/watchlist");
}

export async function dismissMovie(tmdbId: number, reason?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to tune future picks.");

  const movieId = await ensureMovieRow(tmdbId);
  const { error } = await supabase.from("dismissed_movies").upsert(
    {
      user_id: user.id,
      movie_id: movieId,
      reason: reason ?? null,
    },
    { onConflict: "user_id,movie_id" },
  );
  if (error) throw error;
  revalidatePath("/results");
}

export async function saveUserPreferences(payload: {
  favorite_genres?: unknown;
  default_runtime_min?: number | null;
  default_runtime_max?: number | null;
  language_preferences?: unknown;
  tone_preferences?: unknown;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("user_preferences")
      .update(payload)
      .eq("user_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("user_preferences").insert({
      user_id: user.id,
      ...payload,
    });
    if (error) throw error;
  }
  revalidatePath("/profile");
}
