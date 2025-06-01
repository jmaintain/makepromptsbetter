import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const promptOptimizations = pgTable("prompt_optimizations", {
  id: serial("id").primaryKey(),
  originalPrompt: text("original_prompt").notNull(),
  contextText: text("context_text"),
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
  contextText: z.string().max(3000).optional(), // ~500 words max
});

export const optimizePromptResponseSchema = z.object({
  optimizedPrompt: z.string(),
  improvement: z.number(),
});

export const creditsStatusSchema = z.object({
  creditsRemaining: z.number(),
  resetsAt: z.string(),
});

export const ratePromptRequestSchema = z.object({
  prompt: z.string(),
});

export const ratePromptResponseSchema = z.object({
  rating: z.number().min(1).max(10),
  reason: z.string(),
});

export type OptimizePromptRequest = z.infer<typeof optimizePromptRequestSchema>;
export type OptimizePromptResponse = z.infer<typeof optimizePromptResponseSchema>;
export type CreditsStatus = z.infer<typeof creditsStatusSchema>;
export type RatePromptRequest = z.infer<typeof ratePromptRequestSchema>;
export type RatePromptResponse = z.infer<typeof ratePromptResponseSchema>;

// Persona Builder schemas
export const personas = pgTable("personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalInput: text("original_input").notNull(),
  generatedPersona: text("generated_persona").notNull(),
  enhancementResponses: text("enhancement_responses"), // JSON as text for simplicity
  userFingerprint: text("user_fingerprint").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  phase: text("phase").notNull().default("1"), // "1" or "2"
});

export const insertPersonaSchema = createInsertSchema(personas);

export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;

export const createPersonaRequestSchema = z.object({
  input: z.string().min(10).max(1000),
  name: z.string().optional(),
});

export const createPersonaResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  persona: z.string(),
  canEnhance: z.boolean(),
});

export const enhancePersonaRequestSchema = z.object({
  enhancements: z.object({
    communication: z.object({
      formality: z.string().optional(),
      responseLength: z.string().optional(),
      proactiveness: z.string().optional(),
      disagreementHandling: z.string().optional(),
    }).optional(),
    expertise: z.object({
      industryKnowledge: z.string().optional(),
      commonMistakes: z.string().optional(),
      technicalDepth: z.string().optional(),
      toolsIntegration: z.string().optional(),
    }).optional(),
    problemSolving: z.object({
      creativeApproach: z.string().optional(),
      analyticalDetail: z.string().optional(),
      urgencyHandling: z.string().optional(),
      uncertaintyResponse: z.string().optional(),
    }).optional(),
    context: z.object({
      memoryPreferences: z.string().optional(),
      adaptationStyle: z.string().optional(),
      progressTracking: z.string().optional(),
    }).optional(),
  }),
});

export const enhancePersonaResponseSchema = z.object({
  persona: z.string(),
  changes: z.array(z.string()),
});

export type CreatePersonaRequest = z.infer<typeof createPersonaRequestSchema>;
export type CreatePersonaResponse = z.infer<typeof createPersonaResponseSchema>;
export type EnhancePersonaRequest = z.infer<typeof enhancePersonaRequestSchema>;
export type EnhancePersonaResponse = z.infer<typeof enhancePersonaResponseSchema>;
