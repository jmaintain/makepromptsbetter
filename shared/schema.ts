import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const promptOptimizations = pgTable("prompt_optimizations", {
  id: serial("id").primaryKey(),
  originalPrompt: text("original_prompt").notNull(),
  optimizedPrompt: text("optimized_prompt").notNull(),
  improvement: integer("improvement").notNull(),
  userFingerprint: text("user_fingerprint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptOptimizationSchema = createInsertSchema(promptOptimizations).omit({
  id: true,
  createdAt: true,
});

export type InsertPromptOptimization = z.infer<typeof insertPromptOptimizationSchema>;
export type PromptOptimization = typeof promptOptimizations.$inferSelect;

// Request/Response schemas
export const optimizePromptRequestSchema = z.object({
  originalPrompt: z.string().min(1).max(2000),
});

export const optimizePromptResponseSchema = z.object({
  optimizedPrompt: z.string(),
  improvement: z.number(),
});

export const creditsStatusSchema = z.object({
  creditsRemaining: z.number(),
  resetsAt: z.string(),
});

export type OptimizePromptRequest = z.infer<typeof optimizePromptRequestSchema>;
export type OptimizePromptResponse = z.infer<typeof optimizePromptResponseSchema>;
export type CreditsStatus = z.infer<typeof creditsStatusSchema>;
