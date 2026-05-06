import { z } from "zod";

export const llmPickSchema = z.object({
  id: z.number().int(),
  reason: z.string().max(300),
});

export const llmResponseSchema = z.object({
  conflictExplanation: z.string().max(400).optional(),
  picks: z.array(llmPickSchema).min(1).max(16),
});

export type LLMPick = z.infer<typeof llmPickSchema>;
export type LLMRankResponse = z.infer<typeof llmResponseSchema>;
