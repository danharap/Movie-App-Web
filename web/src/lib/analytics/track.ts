"use server";

/**
 * Server-side analytics event tracker.
 * Call from server actions and API routes — never from client components directly.
 * Use the `trackEvent` client-side helper (below) for browser-initiated events.
 */
import { createClient } from "@/lib/supabase/server";

export type AnalyticsEvent =
  | "page_view"
  | "movie_searched"
  | "movie_watched"
  | "movie_unwatched"
  | "watchlist_add"
  | "watchlist_remove"
  | "movie_rated"
  | "movie_review_added"
  | "recommendation_generated"
  | "letterboxd_import_started"
  | "letterboxd_import_completed"
  | "feedback_submitted"
  | "profile_updated"
  | "follow_user"
  | "friend_request_sent"
  | "list_created"
  | "list_movie_added";

export async function trackServerEvent(
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
  userId?: string,
) {
  try {
    const supabase = await createClient();

    // If no userId passed, try to get it from session
    let uid = userId;
    if (!uid) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      uid = user?.id;
    }

    await supabase.from("analytics_events").insert({
      event_name: event,
      user_id: uid ?? null,
      properties: properties ?? null,
    });
  } catch {
    // Analytics failures should never surface to users
  }
}
