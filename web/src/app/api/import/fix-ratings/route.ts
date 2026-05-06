import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Doubles all watched_movies ratings that are ≤ 5.0 for the authenticated user.
 * This corrects ratings that were imported from Letterboxd before the 0-5 → 0-10
 * scale conversion was applied.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all rows with a rating in the 0-5 range (the wrong scale)
  const { data: rows, error: fetchError } = await supabase
    .from("watched_movies")
    .select("movie_id, user_rating")
    .eq("user_id", user.id)
    .not("user_rating", "is", null)
    .lte("user_rating", 5.0);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ fixed: 0 });
  }

  // Update each one individually (Supabase doesn't support arithmetic UPDATE in JS client)
  let fixed = 0;
  let failed = 0;
  for (const row of rows) {
    const newRating = Math.round((row.user_rating as number) * 2 * 10) / 10;
    const { error } = await supabase
      .from("watched_movies")
      .update({ user_rating: newRating })
      .eq("user_id", user.id)
      .eq("movie_id", row.movie_id);

    if (error) {
      failed++;
    } else {
      fixed++;
    }
  }

  return NextResponse.json({ fixed, failed });
}
