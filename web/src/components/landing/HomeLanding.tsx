import { HomeLandingClient } from "@/components/landing/HomeLandingClient";
import { listFeedback } from "@/features/feedback/service";
import { createClient } from "@/lib/supabase/server";
import { getTrendingMovies } from "@/lib/tmdb/client";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function HomeLanding() {
  const [reviews, supabase, trending] = await Promise.all([
    listFeedback(1),
    createClient(),
    getTrendingMovies("week").catch(() => ({ results: [] })),
  ]);
  const { data: { user } } = await supabase.auth.getUser();
  return <HomeLandingClient user={user} reviews={reviews} heroMovies={trending.results ?? []} />;
}
