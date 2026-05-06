import { TMDB_API_BASE } from "./constants";

/** Prefer v4 read token (Bearer); fallback to v3 api_key query param. */
function getTmdbAuth():
  | { kind: "bearer"; token: string }
  | { kind: "query"; apiKey: string } {
  const token = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  if (token) return { kind: "bearer", token };
  const key = process.env.TMDB_API_KEY?.trim();
  if (key) return { kind: "query", apiKey: key };
  throw new Error(
    "Set TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY (see web/.env.example)",
  );
}

export async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.searchParams.set("language", "en-US");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }
  const auth = getTmdbAuth();
  const headers: HeadersInit = {};
  if (auth.kind === "bearer") {
    headers.Authorization = `Bearer ${auth.token}`;
  } else {
    url.searchParams.set("api_key", auth.apiKey);
  }
  const res = await fetch(url.toString(), { headers, next: { revalidate: 300 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDb ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export type DiscoverResponse = {
  page: number;
  results: Array<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
  }>;
  total_pages: number;
};

export async function discoverMovies(searchParams: URLSearchParams) {
  return tmdbFetch<DiscoverResponse>("/discover/movie", Object.fromEntries(searchParams));
}

export type MovieDetailsResponse = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
};

export async function getMovieDetails(tmdbId: number) {
  return tmdbFetch<MovieDetailsResponse>(`/movie/${tmdbId}`);
}

export type MovieSearchResult = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
};

export type MovieSearchResponse = {
  page: number;
  results: MovieSearchResult[];
  total_results: number;
};

export async function searchMovies(query: string, page = "1") {
  const q = query.trim();
  if (!q) {
    return { page: 1, results: [] as MovieSearchResult[], total_results: 0 };
  }
  return tmdbFetch<MovieSearchResponse>("/search/movie", {
    query: q,
    page,
    include_adult: "false",
  });
}

export async function getPopularMovies(page = "1") {
  return tmdbFetch<DiscoverResponse>("/movie/popular", { page });
}

export async function getTrendingMovies(window: "day" | "week" = "week") {
  return tmdbFetch<DiscoverResponse>(`/trending/movie/${window}`);
}
