import Papa from "papaparse";
import { unzipSync, strFromU8 } from "fflate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LetterboxdWatchedEntry {
  title: string;
  year: number | null;
  watchedDate: string | null; // ISO date string
  addedDate: string | null;
  rating: number | null; // 0.5–5.0
  review: string | null;
  isRewatch: boolean;
  tags: string[];
  /** used to deduplicate across sources */
  key: string;
}

export interface LetterboxdWatchlistEntry {
  title: string;
  year: number | null;
  addedDate: string | null;
  key: string;
}

export interface LetterboxdLikedFilm {
  title: string;
  year: number | null;
  key: string;
}

export interface ParsedImport {
  watched: LetterboxdWatchedEntry[];
  watchlist: LetterboxdWatchlistEntry[];
  likedFilms: LetterboxdLikedFilm[];
  profileUsername: string | null;
  stats: {
    diaryRows: number;
    watchedRows: number;
    ratingsRows: number;
    reviewsRows: number;
    watchlistRows: number;
    likedFilmsRows: number;
  };
}

// ---------------------------------------------------------------------------
// Internal CSV row types (matching Letterboxd column names)
// ---------------------------------------------------------------------------

interface DiaryRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string;
  Rewatch: string;
  Tags: string;
  "Watched Date": string;
}

interface WatchedRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
}

interface RatingsRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string;
}

interface ReviewsRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
  Rating: string;
  Rewatch: string;
  Review: string;
  Tags: string;
  "Watched Date": string;
}

interface WatchlistRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
}

interface LikedFilmsRow {
  Date: string;
  Name: string;
  Year: string;
  "Letterboxd URI": string;
}

interface ProfileRow {
  Username: string;
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// CSV Helpers
// ---------------------------------------------------------------------------

function parseCsv<T>(csvText: string): T[] {
  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

function toYear(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 1800 ? n : null;
}

function toRating(s: string | undefined): number | null {
  if (!s || s.trim() === "" || s.trim() === "0") return null;
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0.5 && n <= 5 ? n : null;
}

function toIsoDate(s: string | undefined): string | null {
  if (!s || s.trim() === "") return null;
  // Letterboxd uses YYYY-MM-DD
  return s.trim() || null;
}

function makeKey(title: string, year: string | number | null): string {
  return `${title.toLowerCase().trim()}::${year ?? ""}`;
}

// ---------------------------------------------------------------------------
// File detection by column headers
// ---------------------------------------------------------------------------

type CsvFileType =
  | "diary"
  | "watched"
  | "ratings"
  | "reviews"
  | "watchlist"
  | "likes_films"
  | "profile"
  | "unknown";

function detectCsvType(headers: string[]): CsvFileType {
  const h = new Set(headers);
  if (h.has("Review") && h.has("Watched Date")) return "reviews";
  if (h.has("Rating") && h.has("Watched Date") && h.has("Rewatch"))
    return "diary";
  if (h.has("Rating") && !h.has("Watched Date")) return "ratings";
  if (h.has("Date Joined") || h.has("Username")) return "profile";
  if (h.has("Name") && h.has("Year") && h.has("Date") && h.size <= 5)
    return "watched"; // also matches watchlist/likes — distinguish by path
  return "unknown";
}

function detectCsvTypeByPath(path: string, headers: string[]): CsvFileType {
  const lower = path.toLowerCase();
  if (lower.includes("diary")) return "diary";
  if (lower.includes("review")) return "reviews";
  if (lower.includes("rating")) return "ratings";
  if (lower.includes("watchlist")) return "watchlist";
  if (lower.includes("likes/films") || lower.includes("likes\\films"))
    return "likes_films";
  if (lower.includes("watched")) return "watched";
  if (lower.includes("profile")) return "profile";
  // fallback to header detection
  return detectCsvType(headers);
}

// ---------------------------------------------------------------------------
// Merge logic
// ---------------------------------------------------------------------------

function buildWatchedMap(
  diary: DiaryRow[],
  watched: WatchedRow[],
  ratings: RatingsRow[],
  reviews: ReviewsRow[],
): Map<string, LetterboxdWatchedEntry> {
  const map = new Map<string, LetterboxdWatchedEntry>();

  // Primary: diary rows (richest data)
  for (const row of diary) {
    const key = makeKey(row.Name, row.Year);
    const existing = map.get(key);
    const entry: LetterboxdWatchedEntry = {
      title: row.Name,
      year: toYear(row.Year),
      watchedDate: toIsoDate(row["Watched Date"]) ?? toIsoDate(row.Date),
      addedDate: toIsoDate(row.Date),
      rating: toRating(row.Rating),
      review: null,
      isRewatch: row.Rewatch?.toLowerCase() === "yes",
      tags: row.Tags ? row.Tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      key,
    };
    // Keep the most informative entry (prefer one with rating)
    if (!existing || (entry.rating !== null && existing.rating === null)) {
      map.set(key, entry);
    }
  }

  // Fallback: watched.csv for any not in diary
  for (const row of watched) {
    const key = makeKey(row.Name, row.Year);
    if (!map.has(key)) {
      map.set(key, {
        title: row.Name,
        year: toYear(row.Year),
        watchedDate: toIsoDate(row.Date),
        addedDate: toIsoDate(row.Date),
        rating: null,
        review: null,
        isRewatch: false,
        tags: [],
        key,
      });
    }
  }

  // Fill ratings
  for (const row of ratings) {
    const key = makeKey(row.Name, row.Year);
    const existing = map.get(key);
    const rating = toRating(row.Rating);
    if (existing && existing.rating === null && rating !== null) {
      map.set(key, { ...existing, rating });
    } else if (!existing && rating !== null) {
      map.set(key, {
        title: row.Name,
        year: toYear(row.Year),
        watchedDate: toIsoDate(row.Date),
        addedDate: toIsoDate(row.Date),
        rating,
        review: null,
        isRewatch: false,
        tags: [],
        key,
      });
    }
  }

  // Fill reviews (notes)
  for (const row of reviews) {
    const key = makeKey(row.Name, row.Year);
    const existing = map.get(key);
    const review = row.Review?.trim() || null;
    if (existing && review) {
      map.set(key, {
        ...existing,
        review,
        rating: existing.rating ?? toRating(row.Rating),
        watchedDate:
          existing.watchedDate ??
          toIsoDate(row["Watched Date"]) ??
          toIsoDate(row.Date),
      });
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Main parse functions
// ---------------------------------------------------------------------------

interface CsvFileInput {
  path: string;
  text: string;
}

export function mergeLetterboxdCsvs(files: CsvFileInput[]): ParsedImport {
  let diaryRows: DiaryRow[] = [];
  let watchedRows: WatchedRow[] = [];
  let ratingsRows: RatingsRow[] = [];
  let reviewsRows: ReviewsRow[] = [];
  let watchlistRows: WatchlistRow[] = [];
  let likedFilmsRows: LikedFilmsRow[] = [];
  let profileUsername: string | null = null;

  for (const { path, text } of files) {
    const firstLine = text.split("\n")[0] ?? "";
    const headers = firstLine.split(",").map((h) => h.replace(/^"|"$/g, "").trim());
    const type = detectCsvTypeByPath(path, headers);

    // Skip deleted/orphaned folders — they're historical artifacts
    if (path.toLowerCase().includes("deleted/") || path.toLowerCase().includes("orphaned/")) {
      continue;
    }

    switch (type) {
      case "diary":
        diaryRows = parseCsv<DiaryRow>(text);
        break;
      case "watched":
        watchedRows = parseCsv<WatchedRow>(text);
        break;
      case "ratings":
        ratingsRows = parseCsv<RatingsRow>(text);
        break;
      case "reviews":
        reviewsRows = parseCsv<ReviewsRow>(text);
        break;
      case "watchlist":
        watchlistRows = parseCsv<WatchlistRow>(text);
        break;
      case "likes_films":
        likedFilmsRows = parseCsv<LikedFilmsRow>(text);
        break;
      case "profile": {
        const profileData = parseCsv<ProfileRow>(text);
        if (profileData.length > 0) profileUsername = profileData[0].Username ?? null;
        break;
      }
    }
  }

  const watchedMap = buildWatchedMap(diaryRows, watchedRows, ratingsRows, reviewsRows);

  const watchlist: LetterboxdWatchlistEntry[] = watchlistRows.map((row) => ({
    title: row.Name,
    year: toYear(row.Year),
    addedDate: toIsoDate(row.Date),
    key: makeKey(row.Name, row.Year),
  }));

  const likedFilms: LetterboxdLikedFilm[] = likedFilmsRows.map((row) => ({
    title: row.Name,
    year: toYear(row.Year),
    key: makeKey(row.Name, row.Year),
  }));

  return {
    watched: Array.from(watchedMap.values()),
    watchlist,
    likedFilms,
    profileUsername,
    stats: {
      diaryRows: diaryRows.length,
      watchedRows: watchedRows.length,
      ratingsRows: ratingsRows.length,
      reviewsRows: reviewsRows.length,
      watchlistRows: watchlistRows.length,
      likedFilmsRows: likedFilmsRows.length,
    },
  };
}

/** Extract a ZIP file (as ArrayBuffer) and return the CSV files inside. */
export function extractLetterboxdZip(buffer: ArrayBuffer): CsvFileInput[] {
  const uint8 = new Uint8Array(buffer);
  const unzipped = unzipSync(uint8);

  const csvFiles: CsvFileInput[] = [];
  for (const [path, data] of Object.entries(unzipped)) {
    if (path.endsWith(".csv") && !path.startsWith("__MACOSX")) {
      csvFiles.push({ path, text: strFromU8(data) });
    }
  }
  return csvFiles;
}

/** Parse a Letterboxd ZIP export (ArrayBuffer) into a ParsedImport. */
export function parseLetterboxdZip(buffer: ArrayBuffer): ParsedImport {
  const files = extractLetterboxdZip(buffer);
  return mergeLetterboxdCsvs(files);
}

/** Parse individual CSV File objects uploaded directly by the user. */
export async function parseLetterboxdFiles(
  files: File[],
): Promise<ParsedImport> {
  const csvInputs: CsvFileInput[] = await Promise.all(
    files.map(async (file) => ({
      path: file.name,
      text: await file.text(),
    })),
  );
  return mergeLetterboxdCsvs(csvInputs);
}
