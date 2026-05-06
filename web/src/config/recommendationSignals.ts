/**
 * Signals for conflict detection and bridge genre resolution.
 * A "conflict" occurs when vibe-implied genres and user-picked genres
 * have low or zero overlap — e.g. vibes=[funny, comforting] + genres=[Horror, Thriller].
 * Bridge genres are added to the TMDb discover OR query so that
 * dual-tagged films (horror-comedy, dark-comedy, etc.) can surface.
 */
import { TMDB_GENRES } from "./moodMappings";

/** Genre IDs considered "light / positive" — conflict if picked genres are heavy/dark. */
export const LIGHT_VIBE_GENRE_IDS: Set<number> = new Set([
  TMDB_GENRES.comedy,
  TMDB_GENRES.family,
  TMDB_GENRES.romance,
  TMDB_GENRES.animation,
  TMDB_GENRES.music,
]);

/** Genre IDs considered "dark / heavy" — conflict if vibe is light. */
export const DARK_GENRE_IDS: Set<number> = new Set([
  TMDB_GENRES.horror,
  TMDB_GENRES.thriller,
  TMDB_GENRES.crime,
  TMDB_GENRES.war,
]);

/**
 * Bridge genres added to the discover query when a light-vibe + dark-genre
 * conflict is detected. These exist in TMDb as combined tags.
 */
export const LIGHT_DARK_BRIDGE_IDS: number[] = [
  TMDB_GENRES.comedy,   // horror-comedies carry Comedy
  TMDB_GENRES.fantasy,  // dark fantasy
  TMDB_GENRES.mystery,  // cozy mystery
];

/**
 * Detect whether vibeGenreIds and pickedGenreIds conflict.
 * Returns true when there are light vibes + dark genres with no
 * shared genre between them.
 */
export function detectConflict(
  vibeGenreIds: number[],
  pickedGenreIds: number[],
): boolean {
  if (!vibeGenreIds.length || !pickedGenreIds.length) return false;

  const hasLightVibe = vibeGenreIds.some((id) => LIGHT_VIBE_GENRE_IDS.has(id));
  const hasDarkPick = pickedGenreIds.some((id) => DARK_GENRE_IDS.has(id));
  if (!hasLightVibe || !hasDarkPick) return false;

  // If the picked genres also include at least one light genre there's less tension.
  const hasLightPick = pickedGenreIds.some((id) => LIGHT_VIBE_GENRE_IDS.has(id));
  if (hasLightPick) return false;

  // Conflict only if vibes and picks share no genre.
  const pickSet = new Set(pickedGenreIds);
  const sharedCount = vibeGenreIds.filter((id) => pickSet.has(id)).length;
  return sharedCount === 0;
}

/**
 * Build a human-readable conflict message from vibe/genre names.
 */
export function conflictMessage(vibeLabels: string[], genreNames: string[]): string {
  const vibes = vibeLabels.join(", ").toLowerCase();
  const genres = genreNames.join(" + ");
  return (
    `"${vibes}" vibes + ${genres} is an uncommon mix — showing the closest matches ` +
    `(horror-comedies, dark comedies, and lighter entries in the genre).`
  );
}
