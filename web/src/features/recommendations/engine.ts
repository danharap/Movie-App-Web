import { VIBE_GENRE_IDS, normalizeMoodKey } from "@/config/moodMappings";
import { TMDB_GENRE_BY_ID } from "@/config/tmdbGenres";
import { discoverMovies, getMovieDetails, type DiscoverResponse } from "@/lib/tmdb/client";
import type { RecommendedMovie, RecommendationReason } from "@/types/movie";
import type { RecommendationInput } from "./schema";

type DiscoverMovie = DiscoverResponse["results"][number];

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

function movieMatchesPickedGenres(
  movieGenreIds: number[] | undefined,
  picked: number[],
  mode: "all" | "any",
): boolean {
  const g = movieGenreIds ?? [];
  if (!picked.length) return true;
  if (mode === "all") return picked.every((id) => g.includes(id));
  return picked.some((id) => g.includes(id));
}

function pickedGenreNames(picked: number[]) {
  return picked.map((id) => TMDB_GENRE_BY_ID[id] ?? `#${id}`).join(", ");
}

function buildReasons(
  input: RecommendationInput,
  movieGenreIds: number[],
  vibeGenreSet: Set<number>,
  opts: {
    genreLock: boolean;
    pickedGenres: number[];
    pickedGenreMode: "all" | "any";
  },
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];

  if (opts.genreLock && opts.pickedGenres.length) {
    const modeLabel =
      opts.pickedGenreMode === "all" ? "match all" : "match at least one";
    reasons.push({
      label: `Genres: ${pickedGenreNames(opts.pickedGenres)} (${modeLabel})`,
    });
  } else {
    const vibeLabel = input.vibes.map((v) => v.trim()).filter(Boolean).join(", ");
    reasons.push({ label: `Vibes: ${vibeLabel}` });
    const overlap = movieGenreIds.filter((id) => vibeGenreSet.has(id));
    if (overlap.length) {
      reasons.push({ label: "Genre match for what you asked for" });
    }
  }

  if (input.hiddenGem) {
    reasons.push({ label: "Weighted toward strong ratings vs. hype" });
  }
  if (input.streamingOnly) {
    reasons.push({ label: "Streaming availability filter" });
  }
  return reasons.slice(0, 5);
}

async function discoverPages(
  baseParams: URLSearchParams,
  maxPages: number,
): Promise<DiscoverMovie[]> {
  const merged: DiscoverMovie[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(page));
    const data = await discoverMovies(params);
    for (const r of data.results) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        merged.push(r);
      }
    }
    if (!data.results.length || page >= (data.total_pages ?? 1)) break;
  }
  return merged;
}

export async function runRecommendationEngine(
  input: RecommendationInput,
  excludeTmdbIds: Set<number>,
): Promise<RecommendedMovie[]> {
  const userPicked = uniq(input.genres ?? []);
  const genreLock = userPicked.length > 0;

  const vibeKeys = input.vibes.map((v) => normalizeMoodKey(v));
  const hasNostalgic = vibeKeys.includes("nostalgic");

  let genreIdsForDiscover: number[] = [];
  if (!genreLock) {
    for (const k of vibeKeys) {
      genreIdsForDiscover.push(...(VIBE_GENRE_IDS[k] ?? []));
    }
    genreIdsForDiscover = uniq(genreIdsForDiscover);
  }

  const vibeGenreSet = new Set(genreIdsForDiscover);

  if (genreLock) {
    genreIdsForDiscover = [...userPicked];
  } else {
    if (input.surpriseMe && genreIdsForDiscover.length > 0) {
      genreIdsForDiscover = shuffle(genreIdsForDiscover, Math.random).slice(
        0,
        Math.max(3, Math.min(genreIdsForDiscover.length, 6)),
      );
    }
  }

  const params = new URLSearchParams();
  params.set("vote_count.gte", "60");
  params.set("vote_average.gte", String(input.minVoteAverage));
  params.set("include_adult", "false");

  if (genreIdsForDiscover.length) {
    params.set("with_genres", genreIdsForDiscover.join("|"));
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
  } else if (hasNostalgic && !input.eraMaxYear) {
    params.set("primary_release_date.lte", "1999-12-31");
  }

  if (input.language) {
    params.set("with_original_language", input.language);
  }

  if (input.streamingOnly && input.watchRegion) {
    params.set("watch_region", input.watchRegion);
    params.set("with_watch_monetization_types", "flatrate");
  }

  const maxPages = genreLock ? 6 : 2;
  const results = await discoverPages(params, maxPages);

  const baseFilter = (m: DiscoverMovie) =>
    m.id &&
    m.title &&
    !excludeTmdbIds.has(m.id) &&
    (m.vote_count ?? 0) >= 40;

  let filtered = results.filter(baseFilter);
  let pickedGenreMode: "all" | "any" = "any";

  if (genreLock) {
    const strictList = filtered.filter((m) =>
      movieMatchesPickedGenres(m.genre_ids, userPicked, "all"),
    );
    if (strictList.length > 0) {
      filtered = strictList;
      pickedGenreMode = "all";
    } else {
      filtered = filtered.filter((m) =>
        movieMatchesPickedGenres(m.genre_ids, userPicked, "any"),
      );
      pickedGenreMode = "any";
    }
  }

  const scored = filtered
    .map((m) => ({
      m,
      s: score(m, input.hiddenGem ?? false),
    }))
    .sort((a, b) => b.s - a.s);

  const uniqueById = new Map<number, DiscoverMovie>();
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

  const out: RecommendedMovie[] = [];

  for (const { summary, details } of detailed) {
    const src = details ?? summary;
    const genreIdsList =
      details?.genres?.map((g) => g.id) ?? summary.genre_ids ?? [];

    if (
      genreLock &&
      !movieMatchesPickedGenres(genreIdsList, userPicked, pickedGenreMode)
    ) {
      continue;
    }

    const reasons = buildReasons(input, genreIdsList, vibeGenreSet, {
      genreLock,
      pickedGenres: userPicked,
      pickedGenreMode,
    });

    out.push({
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
    });
  }

  return out;
}
