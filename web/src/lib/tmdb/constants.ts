export const TMDB_API_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size: "w92" | "w342" | "w500" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * TMDb movie IDs and TV IDs occupy the same numeric space and can collide.
 * We store TV entries in the shared `movies` table with a 10 million offset
 * so that tmdb_id 1399 (a movie) never conflicts with tv tmdb_id 1399 (e.g. GoT).
 * No DB schema change required.
 */
export const TV_TMDB_OFFSET = 10_000_000;
export const toTVStoredId = (tmdbId: number) => tmdbId + TV_TMDB_OFFSET;
