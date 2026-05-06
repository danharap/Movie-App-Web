import { createClient } from "@/lib/supabase/server";
import type { AppFeedbackRow } from "./schema";

const TABLE = "app_feedback" as const;
const PAGE_SIZE = 20;

export async function listFeedback(page = 1): Promise<AppFeedbackRow[]> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, user_id, reviewer_display_name, rating, body, created_at, updated_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return (data ?? []) as AppFeedbackRow[];
}

export async function getOwnFeedback(userId: string): Promise<AppFeedbackRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as AppFeedbackRow | null) ?? null;
}
