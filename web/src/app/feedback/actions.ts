"use server";

import { createClient } from "@/lib/supabase/server";
import { feedbackInputSchema } from "@/features/feedback/schema";
import { revalidatePath } from "next/cache";

async function getAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to leave a review.");
  return { supabase, user };
}

async function resolveDisplayName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return "Anonymous user";
  return (
    (data.display_name as string | null)?.trim() ||
    (data.email as string | null)?.split("@")[0] ||
    "Anonymous user"
  );
}

export async function upsertAppFeedback(raw: {
  rating: number;
  body: string;
}): Promise<void> {
  const { supabase, user } = await getAuthedUser();
  const parsed = feedbackInputSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    throw new Error(firstError);
  }
  const { rating, body } = parsed.data;
  const reviewer_display_name = await resolveDisplayName(supabase, user.id);

  const { error } = await supabase.from("app_feedback").upsert(
    {
      user_id: user.id,
      reviewer_display_name,
      rating,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/feedback");
}

export async function deleteAppFeedback(): Promise<void> {
  const { supabase, user } = await getAuthedUser();
  const { error } = await supabase
    .from("app_feedback")
    .delete()
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/feedback");
}
