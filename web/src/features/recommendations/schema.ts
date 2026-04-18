import { z } from "zod";

export const recommendationInputSchema = z.object({
  mood: z.string().min(1, "Pick how you’re feeling"),
  genres: z.array(z.number().int()).optional().default([]),
  tone: z.array(z.string()).optional().default([]),
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
