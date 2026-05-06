import { createClient } from "@/lib/supabase/server";

export type PublicProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  profile_background_url: string | null;
  is_public: boolean;
  watchlist_public: boolean;
};

export type FriendshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "accepted";

export type SocialActivityItem = {
  watched_at: string | null;
  user_rating: number | null;
  movie: {
    tmdb_id: number;
    title: string;
    poster_path: string | null;
  } | null;
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

/** Search public profiles by username prefix */
export async function searchUsers(
  query: string,
  currentUserId?: string,
): Promise<(PublicProfile & { friendshipStatus: FriendshipStatus })[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, banner_url, profile_background_url, is_public, watchlist_public",
      )
      .ilike("username", `${q}%`)
      .eq("is_public", true)
      .neq("id", currentUserId ?? "00000000-0000-0000-0000-000000000000")
      .limit(20);

    if (error) {
      console.error("[users] searchUsers:", error.code, error.message);
      return [];
    }

    const profiles = (data ?? []) as PublicProfile[];
    if (!currentUserId || profiles.length === 0) {
      return profiles.map((p) => ({ ...p, friendshipStatus: "none" as FriendshipStatus }));
    }

    // Batch-fetch friendship statuses
    const ids = profiles.map((p) => p.id);
    const { data: friendships } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id, status")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.in.(${ids.join(",")})),` +
          `and(addressee_id.eq.${currentUserId},requester_id.in.(${ids.join(",")}))`,
      );

    const fsMap = new Map<string, FriendshipStatus>();
    for (const f of friendships ?? []) {
      const otherId =
        f.requester_id === currentUserId ? f.addressee_id : f.requester_id;
      if (f.status === "accepted") {
        fsMap.set(otherId, "accepted");
      } else if (f.requester_id === currentUserId) {
        fsMap.set(otherId, "pending_sent");
      } else {
        fsMap.set(otherId, "pending_received");
      }
    }

    return profiles.map((p) => ({
      ...p,
      friendshipStatus: fsMap.get(p.id) ?? "none",
    }));
  } catch (e) {
    console.error("[users] searchUsers unexpected:", e);
    return [];
  }
}

/** Load a public profile by username */
export async function getProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, banner_url, profile_background_url, is_public, watchlist_public",
      )
      .eq("username", username.toLowerCase())
      .maybeSingle();
    return (data as PublicProfile | null) ?? null;
  } catch {
    return null;
  }
}

/** Load friendship status between two users */
export async function getFriendshipStatus(
  currentUserId: string,
  targetId: string,
): Promise<FriendshipStatus> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id, status")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${targetId}),` +
          `and(requester_id.eq.${targetId},addressee_id.eq.${currentUserId})`,
      )
      .maybeSingle();

    if (!data) return "none";
    if (data.status === "accepted") return "accepted";
    if (data.requester_id === currentUserId) return "pending_sent";
    return "pending_received";
  } catch {
    return "none";
  }
}

/** Load accepted friends for a user */
export async function getFriends(userId: string): Promise<PublicProfile[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted");

    if (!data || data.length === 0) return [];

    const friendIds = data.map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id,
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, bio, avatar_url, banner_url, profile_background_url, is_public, watchlist_public",
      )
      .in("id", friendIds);

    return (profiles ?? []) as PublicProfile[];
  } catch (e) {
    console.error("[users] getFriends:", e);
    return [];
  }
}

/** Pending incoming requests */
export async function getPendingRequests(userId: string): Promise<
  (PublicProfile & { requesterId: string })[]
> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("friendships")
      .select(
        "requester_id, profiles!friendships_requester_id_fkey(id, username, display_name, bio, avatar_url, banner_url, profile_background_url, is_public, watchlist_public)",
      )
      .eq("addressee_id", userId)
      .eq("status", "pending");

    return (data ?? []).map((row) => {
      const p = (row as unknown as { profiles: PublicProfile }).profiles;
      return { ...p, requesterId: row.requester_id };
    });
  } catch (e) {
    console.error("[users] getPendingRequests:", e);
    return [];
  }
}

/** Recent watched activity from accepted friends + followed users */
export async function getSocialActivity(
  userId: string,
  limit = 24,
): Promise<SocialActivityItem[]> {
  try {
    const supabase = await createClient();

    const [{ data: friendships }, { data: follows }] = await Promise.all([
      supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq("status", "accepted"),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId),
    ]);

    const socialIds = new Set<string>();
    for (const f of friendships ?? []) {
      socialIds.add(f.requester_id === userId ? f.addressee_id : f.requester_id);
    }
    for (const f of follows ?? []) {
      if (f.following_id !== userId) socialIds.add(f.following_id);
    }

    const ids = [...socialIds];
    if (ids.length === 0) return [];

    const { data: rows, error } = await supabase
      .from("watched_movies")
      .select(
        "watched_at, user_rating, user_id, movies!watched_movies_movie_id_fkey(tmdb_id, title, poster_path), profiles!watched_movies_user_id_fkey(id, username, display_name, avatar_url)",
      )
      .in("user_id", ids)
      .order("watched_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[users] getSocialActivity:", error.code, error.message);
      return [];
    }

    return (rows ?? []).map((r) => {
      const movieRaw = r.movies as
        | { tmdb_id: number; title: string; poster_path: string | null }
        | { tmdb_id: number; title: string; poster_path: string | null }[]
        | null;
      const movie = Array.isArray(movieRaw) ? movieRaw[0] : movieRaw;

      const userRaw = r.profiles as
        | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
        | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }[]
        | null;
      const actor = Array.isArray(userRaw) ? userRaw[0] : userRaw;

      return {
        watched_at: r.watched_at as string | null,
        user_rating: r.user_rating as number | null,
        movie: movie
          ? {
              tmdb_id: movie.tmdb_id,
              title: movie.title,
              poster_path: movie.poster_path,
            }
          : null,
        user: actor
          ? {
              id: actor.id,
              username: actor.username,
              display_name: actor.display_name,
              avatar_url: actor.avatar_url,
            }
          : null,
      };
    });
  } catch (e) {
    console.error("[users] getSocialActivity unexpected:", e);
    return [];
  }
}
