import { z } from "zod";

export const feedbackInputSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  body: z
    .string()
    .trim()
    .min(10, "Review must be at least 10 characters")
    .max(2000, "Review must be under 2000 characters"),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

export type AppFeedbackRow = {
  id: number;
  user_id: string;
  reviewer_display_name: string;
  rating: number;
  body: string;
  created_at: string;
  updated_at: string;
};
