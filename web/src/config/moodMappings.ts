/**
 * Maps moods / tones to TMDb genre IDs (discover with_genres).
 * Tweak here without touching engine code.
 * @see https://developer.themoviedb.org/reference/genre-movie-list
 */
export const TMDB_GENRES = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  scienceFiction: 878,
  tvMovie: 10770,
  thriller: 53,
  war: 10752,
  western: 37,
} as const;

export const MOOD_GENRE_IDS: Record<string, number[]> = {
  comforting: [
    TMDB_GENRES.family,
    TMDB_GENRES.romance,
    TMDB_GENRES.comedy,
    TMDB_GENRES.drama,
  ],
  intense: [
    TMDB_GENRES.thriller,
    TMDB_GENRES.crime,
    TMDB_GENRES.action,
    TMDB_GENRES.war,
  ],
  emotional: [TMDB_GENRES.drama, TMDB_GENRES.romance],
  funny: [TMDB_GENRES.comedy],
  dark: [TMDB_GENRES.thriller, TMDB_GENRES.mystery, TMDB_GENRES.horror, TMDB_GENRES.crime],
  mind_bending: [
    TMDB_GENRES.scienceFiction,
    TMDB_GENRES.mystery,
    TMDB_GENRES.thriller,
  ],
  adventurous: [TMDB_GENRES.fantasy, TMDB_GENRES.action, TMDB_GENRES.adventure],
  nostalgic: [TMDB_GENRES.drama, TMDB_GENRES.history, TMDB_GENRES.western],
  cozy: [TMDB_GENRES.comedy, TMDB_GENRES.romance, TMDB_GENRES.family],
  any: [],
};

export const TONE_GENRE_IDS: Record<string, number[]> = {
  funny: [TMDB_GENRES.comedy],
  dark: [TMDB_GENRES.horror, TMDB_GENRES.thriller, TMDB_GENRES.crime],
  intense: [TMDB_GENRES.thriller, TMDB_GENRES.action, TMDB_GENRES.war],
  comforting: [TMDB_GENRES.family, TMDB_GENRES.romance],
  emotional: [TMDB_GENRES.drama, TMDB_GENRES.romance],
  weird: [TMDB_GENRES.scienceFiction, TMDB_GENRES.fantasy, TMDB_GENRES.horror],
  romantic: [TMDB_GENRES.romance, TMDB_GENRES.comedy],
  epic: [TMDB_GENRES.adventure, TMDB_GENRES.fantasy, TMDB_GENRES.history],
};

export function normalizeMoodKey(raw: string) {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
