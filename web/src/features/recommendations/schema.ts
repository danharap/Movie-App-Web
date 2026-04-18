import { z } from "zod";

export const recommendationInputSchema = z.object({
  /** One or more vibe chips; each maps to TMDb genre buckets (unless genres lock). */
  vibes: z
    .array(z.string().trim().min(1))
    .min(1, "Pick at least one vibe")
    .max(8),
  genres: z.array(z.number().int()).optional().default([]),
  runtimeMin: z.number().int().min(0).optional(),
  runtimeMax: z.number().int().min(0).optional(),
  minVoteAverage: z.number().min(0).max(10).optional().default(6),
  eraMinYear: z.number().int().min(1900).max(2035).optional(),
  eraMaxYear: z.number().int().min(1900).max(2035).optional(),
  language: z.string().length(2).optional(),
  surpriseMe: z.boolean().optional().default(false),
  hiddenGem: z.boolean().optional().default(false),
  streamingOnly: z.boolean().optional().default(false),
  watchRegion: z.string().length(2).optional(),
});

export type RecommendationInput = z.infer<typeof recommendationInputSchema>;
