import { createClient } from "@/lib/supabase/server";
import type { AppFeedbackRow } from "./schema";

const TABLE = "app_feedback" as const;
const PAGE_SIZE = 20;

export async function listFeedback(page = 1): Promise<AppFeedbackRow[]> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from(TABLE)
      .select("id, user_id, reviewer_display_name, rating, body, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      // Table may not exist yet (migration pending) — log silently, return empty.
      console.error("[feedback] listFeedback error:", error.code, error.message);
      return [];
    }
    return (data ?? []) as AppFeedbackRow[];
  } catch (e) {
    console.error("[feedback] listFeedback unexpected:", e);
    return [];
  }
}

export async function getOwnFeedback(userId: string): Promise<AppFeedbackRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[feedback] getOwnFeedback error:", error.code, error.message);
      return null;
    }
    return (data as AppFeedbackRow | null) ?? null;
  } catch (e) {
    console.error("[feedback] getOwnFeedback unexpected:", e);
    return null;
  }
}
