import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb/client";

export interface ConfirmedWatchedItem {
  tmdbId: number;
  watchedDate: string | null;
  rating: number | null;
  review: string | null;
}

export interface ConfirmedWatchlistItem {
  tmdbId: number;
}

export interface SaveRequestBody {
  watched: ConfirmedWatchedItem[];
  watchlist: ConfirmedWatchlistItem[];
  /**
   * "overwrite": upsert — update rating/notes/date for existing entries.
   * "skip": insert only new movies, leave existing ones untouched.
   * "check": dry run — just return how many duplicates exist, don't write anything.
   */
  mode: "overwrite" | "skip" | "check";
}

export interface SaveResponseBody {
  watchedImported: number;
  watchedSkipped: number;
  watchedDuplicates: number;
  watchlistImported: number;
  watchlistSkipped: number;
  errors: string[];
}

async function ensureMovieRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tmdbId: number,
): Promise<number | null> {
  const { data: existing } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (existing?.id) return Number(existing.id);

  try {
    const d = await getMovieDetails(tmdbId);
    const year =
      d.release_date && d.release_date.length >= 4
        ? Number(d.release_date.slice(0, 4))
        : null;

    const { data, error } = await supabase
      .from("movies")
      .upsert(
        {
          tmdb_id: tmdbId,
          title: d.title,
          release_year: Number.isFinite(year) ? year : null,
          poster_path: d.poster_path,
          backdrop_path: d.backdrop_path,
          overview: d.overview,
          runtime: d.runtime,
          vote_average: d.vote_average,
          vote_count: d.vote_count,
          genres: d.genres,
        },
        { onConflict: "tmdb_id" },
      )
      .select("id")
      .single();

    if (error || !data) return null;
    return Number(data.id);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SaveRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mode = body.mode ?? "overwrite";

  // ── Check mode: count duplicates without writing ───────────────────────────
  if (mode === "check") {
    const tmdbIds = (body.watched ?? []).map((w) => w.tmdbId);
    if (tmdbIds.length === 0) {
      return NextResponse.json({
        watchedImported: 0,
        watchedSkipped: 0,
        watchedDuplicates: 0,
        watchlistImported: 0,
        watchlistSkipped: 0,
        errors: [],
      } satisfies SaveResponseBody);
    }

    // Find which tmdbIds already have a movies row the user has watched
    const { data: existingMovies } = await supabase
      .from("movies")
      .select("id, tmdb_id")
      .in("tmdb_id", tmdbIds);

    const existingMovieIds = (existingMovies ?? []).map((m) => Number(m.id));

    let duplicates = 0;
    if (existingMovieIds.length > 0) {
      const { count } = await supabase
        .from("watched_movies")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("movie_id", existingMovieIds);
      duplicates = count ?? 0;
    }

    return NextResponse.json({
      watchedImported: 0,
      watchedSkipped: 0,
      watchedDuplicates: duplicates,
      watchlistImported: 0,
      watchlistSkipped: 0,
      errors: [],
    } satisfies SaveResponseBody);
  }

  // ── Actual save (overwrite or skip) ────────────────────────────────────────
  const stats: SaveResponseBody = {
    watchedImported: 0,
    watchedSkipped: 0,
    watchedDuplicates: 0,
    watchlistImported: 0,
    watchlistSkipped: 0,
    errors: [],
  };

  for (const item of body.watched ?? []) {
    const movieId = await ensureMovieRow(supabase, item.tmdbId);
    if (!movieId) {
      stats.watchedSkipped++;
      continue;
    }

    if (mode === "skip") {
      // Insert only — ignore if already exists
      const { error } = await supabase.from("watched_movies").insert({
        user_id: user.id,
        movie_id: movieId,
        watched_at: item.watchedDate
          ? new Date(item.watchedDate).toISOString()
          : new Date().toISOString(),
        user_rating: item.rating ?? null,
        notes: item.review ?? null,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint — already exists, intentionally skipped
          stats.watchedDuplicates++;
        } else {
          stats.watchedSkipped++;
          stats.errors.push(`Insert error: ${error.message}`);
        }
      } else {
        stats.watchedImported++;
      }
    } else {
      // Overwrite (upsert)
      const { error } = await supabase.from("watched_movies").upsert(
        {
          user_id: user.id,
          movie_id: movieId,
          watched_at: item.watchedDate
            ? new Date(item.watchedDate).toISOString()
            : new Date().toISOString(),
          user_rating: item.rating ?? null,
          notes: item.review ?? null,
        },
        { onConflict: "user_id,movie_id" },
      );

      if (error) {
        stats.watchedSkipped++;
        stats.errors.push(`Upsert error: ${error.message}`);
      } else {
        stats.watchedImported++;
      }
    }
  }

  for (const item of body.watchlist ?? []) {
    const movieId = await ensureMovieRow(supabase, item.tmdbId);
    if (!movieId) {
      stats.watchlistSkipped++;
      continue;
    }

    const { error } = await supabase.from("watchlist").upsert(
      { user_id: user.id, movie_id: movieId },
      { onConflict: "user_id,movie_id" },
    );

    if (error) {
      stats.watchlistSkipped++;
    } else {
      stats.watchlistImported++;
    }
  }

  return NextResponse.json(stats satisfies SaveResponseBody);
}
