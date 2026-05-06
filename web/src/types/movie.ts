export type Genre = { id: number; name: string };

export type TmdbMovieSummary = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  runtime?: number | null;
};

export type RecommendationReason = {
  label: string;
  /** "vibe" | "genre" | "quality" | "llm" | "conflict" */
  kind?: string;
};

export type FinderMeta = {
  conflictDetected: boolean;
  userMessage: string;
};

export type RecommendedMovie = TmdbMovieSummary & {
  release_year: number | null;
  reasons: RecommendationReason[];
};

export type RecommendationResponse = {
  movies: RecommendedMovie[];
  finderMeta?: FinderMeta;
  llmSkipped?: boolean;
};
