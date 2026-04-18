import {
  MOOD_GENRE_IDS,
  TONE_GENRE_IDS,
  normalizeMoodKey,
} from "@/config/moodMappings";
import { discoverMovies, getMovieDetails } from "@/lib/tmdb/client";
import type { RecommendedMovie, RecommendationReason } from "@/types/movie";
import type { RecommendationInput } from "./schema";

function uniq(ids: number[]) {
  return [...new Set(ids.filter(Boolean))];
}

function shuffle<T>(arr: T[], seedRandom: () => number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seedRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function score(
  m: { vote_average: number; popularity: number },
  hiddenGem: boolean,
) {
  const vote = m.vote_average ?? 0;
  const pop = m.popularity ?? 0;
  if (hiddenGem) {
    return vote * 2.2 - Math.log1p(pop) * 0.18;
  }
  return vote * 1.4 + Math.log1p(pop) * 0.22;
}

function yearFromDate(release_date: string) {
  if (!release_date || release_date.length < 4) return null;
  const y = Number(release_date.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

function buildReasons(
  input: RecommendationInput,
  movieGenreIds: number[],
  moodGenreSet: Set<number>,
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];
  reasons.push({ label: `Mood: ${input.mood.trim()}` });
  for (const t of input.tone) {
    reasons.push({ label: `Tone: ${t}` });
  }
  const overlap = movieGenreIds.filter((id) => moodGenreSet.has(id));
  if (overlap.length) {
    reasons.push({ label: "Genre match for what you asked for" });
  }
  if (input.hiddenGem) {
    reasons.push({ label: "Weighted toward strong ratings vs. hype" });
  }
  if (input.streamingOnly) {
    reasons.push({ label: "Streaming availability filter" });
  }
  return reasons.slice(0, 5);
}

export async function runRecommendationEngine(
  input: RecommendationInput,
  excludeTmdbIds: Set<number>,
): Promise<RecommendedMovie[]> {
  const moodKey = normalizeMoodKey(input.mood);
  const moodGenres = MOOD_GENRE_IDS[moodKey] ?? MOOD_GENRE_IDS.any;
  let genreIds = [...moodGenres, ...input.genres];
  for (const t of input.tone) {
    const tk = normalizeMoodKey(t);
    genreIds.push(...(TONE_GENRE_IDS[tk] ?? []));
  }
  genreIds = uniq(genreIds);

  if (input.surpriseMe) {
    genreIds = shuffle(genreIds, Math.random).slice(
      0,
      Math.max(3, Math.min(genreIds.length, 6)),
    );
  }

  const moodGenreSet = new Set(moodGenres);

  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("vote_count.gte", "60");
  params.set("vote_average.gte", String(input.minVoteAverage));
  params.set("include_adult", "false");

  if (genreIds.length) {
    params.set("with_genres", genreIds.join("|"));
  }
  params.set("sort_by", input.hiddenGem ? "vote_average.desc" : "popularity.desc");

  if (input.runtimeMin != null) {
    params.set("with_runtime.gte", String(input.runtimeMin));
  }
  if (input.runtimeMax != null) {
    params.set("with_runtime.lte", String(input.runtimeMax));
  }

  if (input.eraMinYear != null) {
    params.set("primary_release_date.gte", `${input.eraMinYear}-01-01`);
  }
  if (input.eraMaxYear != null) {
    params.set("primary_release_date.lte", `${input.eraMaxYear}-12-31`);
  } else if (moodKey === "nostalgic" && !input.eraMaxYear) {
    params.set("primary_release_date.lte", "1999-12-31");
  }

  if (input.language) {
    params.set("with_original_language", input.language);
  }

  if (input.streamingOnly && input.watchRegion) {
    params.set("watch_region", input.watchRegion);
    params.set("with_watch_monetization_types", "flatrate");
  }

  const first = await discoverMovies(params);
  let results = [...first.results];

  if (first.total_pages > 1 && results.length < 40) {
    params.set("page", "2");
    const second = await discoverMovies(params);
    results = results.concat(second.results);
  }

  const filtered = results.filter(
    (m) =>
      m.id &&
      m.title &&
      !excludeTmdbIds.has(m.id) &&
      (m.vote_count ?? 0) >= 40,
  );

  const scored = filtered
    .map((m) => ({
      m,
      s: score(m, input.hiddenGem ?? false),
    }))
    .sort((a, b) => b.s - a.s);

  const uniqueById = new Map<number, (typeof scored)[0]["m"]>();
  for (const { m } of scored) {
    if (!uniqueById.has(m.id)) uniqueById.set(m.id, m);
  }

  const top = [...uniqueById.values()].slice(0, 8);

  const detailed = await Promise.all(
    top.map(async (m) => {
      try {
        const d = await getMovieDetails(m.id);
        return { summary: m, details: d };
      } catch {
        return { summary: m, details: null };
      }
    }),
  );

  const out: RecommendedMovie[] = detailed.map(({ summary, details }) => {
    const src = details ?? summary;
    const genreIdsList = details?.genres?.map((g) => g.id) ?? summary.genre_ids ?? [];
    const reasons = buildReasons(input, genreIdsList, moodGenreSet);
    return {
      id: src.id,
      title: src.title,
      overview: src.overview,
      poster_path: src.poster_path,
      backdrop_path: src.backdrop_path,
      release_date: "release_date" in src ? src.release_date : summary.release_date,
      vote_average: src.vote_average,
      vote_count: src.vote_count,
      popularity: src.popularity,
      genre_ids: genreIdsList,
      runtime: details?.runtime ?? null,
      release_year: yearFromDate(
        "release_date" in src ? src.release_date : summary.release_date,
      ),
      reasons,
    };
  });

  return out;
}
