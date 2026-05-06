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
}

export interface SaveResponseBody {
  watchedImported: number;
  watchedSkipped: number;
  watchlistImported: number;
  watchlistSkipped: number;
  errors: string[];
}

async function ensureMovieRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tmdbId: number,
): Promise<number | null> {
  // Check cache first
  const { data: existing } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (existing?.id) return Number(existing.id);

  // Fetch from TMDB and cache
  try {
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
      vote_count: d.vote_count,
      genres: d.genres,
    };

    const { data, error } = await supabase
      .from("movies")
      .upsert(row, { onConflict: "tmdb_id" })
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

  const stats: SaveResponseBody = {
    watchedImported: 0,
    watchedSkipped: 0,
    watchlistImported: 0,
    watchlistSkipped: 0,
    errors: [],
  };

  // Import watched movies
  for (const item of body.watched ?? []) {
    const movieId = await ensureMovieRow(supabase, item.tmdbId);
    if (!movieId) {
      stats.watchedSkipped++;
      stats.errors.push(`Could not cache TMDB movie ${item.tmdbId}`);
      continue;
    }

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
      stats.errors.push(`watched_movies upsert error: ${error.message}`);
    } else {
      stats.watchedImported++;
    }
  }

  // Import watchlist
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
