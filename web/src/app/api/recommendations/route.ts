import { runRecommendationEngine } from "@/features/recommendations/engine";
import { llmRerank } from "@/features/recommendations/llmRank";
import { recommendationInputSchema } from "@/features/recommendations/schema";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function loadExcludedTmdbIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<Set<number>> {
  const exclude = new Set<number>();

  const { data: watchedRows } = await supabase
    .from("watched_movies")
    .select("movie_id")
    .eq("user_id", userId);

  const { data: dismissedRows } = await supabase
    .from("dismissed_movies")
    .select("movie_id")
    .eq("user_id", userId);

  const movieIds = [
    ...(watchedRows ?? []).map((r) => r.movie_id),
    ...(dismissedRows ?? []).map((r) => r.movie_id),
  ].filter(Boolean);

  if (!movieIds.length) return exclude;

  const { data: movies } = await supabase
    .from("movies")
    .select("tmdb_id")
    .in("id", movieIds);

  for (const m of movies ?? []) {
    if (m.tmdb_id != null) exclude.add(m.tmdb_id);
  }

  return exclude;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = recommendationInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let excludeTmdb = new Set<number>();
    if (user) {
      excludeTmdb = await loadExcludedTmdbIds(supabase, user.id);
    }

    const { movies: candidates, finderMeta } = await runRecommendationEngine(
      parsed.data,
      excludeTmdb,
    );

    // Optional LLM re-ranking — falls back gracefully if key absent or call fails.
    const { movies, llmSkipped, conflictExplanation } = await llmRerank(
      candidates,
      parsed.data,
    );

    // Merge LLM conflict explanation into finderMeta if present.
    const mergedFinderMeta = conflictExplanation
      ? { ...finderMeta, userMessage: conflictExplanation }
      : finderMeta;

    if (user) {
      await supabase.from("recommendation_sessions").insert({
        user_id: user.id,
        input_payload: parsed.data,
        result_movie_ids: movies.map((m) => m.id),
      });
    }

    return NextResponse.json({
      movies,
      input: parsed.data,
      finderMeta: mergedFinderMeta,
      llmSkipped,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status =
      message.includes("TMDB_READ_ACCESS_TOKEN") ||
      message.includes("TMDB_API_KEY")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
