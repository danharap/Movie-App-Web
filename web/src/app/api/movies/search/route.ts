import { searchMovies } from "@/lib/tmdb/client";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 15;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("q") ?? "";
  const q = raw.trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [], total_results: 0 });
  }
  if (q.length > 120) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const data = await searchMovies(q, "1");
    const results = (data.results ?? []).slice(0, MAX_RESULTS);
    return NextResponse.json({
      results,
      total_results: data.total_results ?? results.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed";
    const status = message.includes("TMDB_") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
