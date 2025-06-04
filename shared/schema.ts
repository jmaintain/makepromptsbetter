import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index, decimal, boolean, date } from "drizzle-orm/pg-core";
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
  resetsAt: z.string().nullable(),
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
  isSaved: text("is_saved").notNull().default("false"),
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

export const savePersonaResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const testPersonaRequestSchema = z.object({
  personaId: z.number(),
  testPrompt: z.string(),
});

export const testPersonaResponseSchema = z.object({
  response: z.string(),
});

export type CreatePersonaRequest = z.infer<typeof createPersonaRequestSchema>;
export type CreatePersonaResponse = z.infer<typeof createPersonaResponseSchema>;
export type EnhancePersonaRequest = z.infer<typeof enhancePersonaRequestSchema>;
export type EnhancePersonaResponse = z.infer<typeof enhancePersonaResponseSchema>;
export type SavePersonaResponse = z.infer<typeof savePersonaResponseSchema>;
export type TestPersonaRequest = z.infer<typeof testPersonaRequestSchema>;
export type TestPersonaResponse = z.infer<typeof testPersonaResponseSchema>;

// Pricing and subscription schema
export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // free, starter, pro
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  annualPrice: decimal("annual_price", { precision: 10, scale: 2 }),
  monthlyPrompts: integer("monthly_prompts").notNull(),
  inputWordLimit: integer("input_word_limit").notNull(),
  responseWordLimit: integer("response_word_limit"), // null for unlimited
  rateLimitSeconds: integer("rate_limit_seconds").notNull(),
  features: jsonb("features").notNull(), // JSON array of features
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for auth and billing
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).notNull().default("free"),
  monthlyUsage: integer("monthly_usage").notNull().default(0),
  usageResetDate: date("usage_reset_date").notNull().defaultNow(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  tokenBalance: integer("token_balance").notNull().default(0),
  hasEverPurchased: boolean("has_ever_purchased").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Token packages for purchase
export const tokenPackages = pgTable("token_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  tokens: integer("tokens").notNull(),
  priceUsd: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
  perTokenRate: decimal("per_token_rate", { precision: 10, scale: 4 }).notNull(),
  description: text("description"),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  metadata: jsonb("metadata"), // Store Stripe Price IDs and other metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User token balances and transaction history
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'purchase', 'deduction', 'refund', 'bonus'
  amount: integer("amount").notNull(), // positive for credits, negative for debits
  description: text("description").notNull(),
  referenceId: varchar("reference_id", { length: 100 }), // Stripe payment ID, optimization ID, etc.
  balanceAfter: integer("balance_after").notNull(),
  metadata: jsonb("metadata"), // Additional context like package info, optimization details
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("token_transactions_user_id_idx").on(table.userId),
  typeIdx: index("token_transactions_type_idx").on(table.type),
  createdAtIdx: index("token_transactions_created_at_idx").on(table.createdAt),
}));

// Payment records for audit and reconciliation
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }).notNull().unique(),
  stripeSessionId: varchar("stripe_session_id", { length: 200 }),
  packageId: integer("package_id").notNull(),
  amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
  tokensGranted: integer("tokens_granted").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'completed', 'failed', 'refunded'
  metadata: jsonb("metadata"), // Stripe webhook data, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("payments_user_id_idx").on(table.userId),
  statusIdx: index("payments_status_idx").on(table.status),
  stripePaymentIntentIdx: index("payments_stripe_payment_intent_idx").on(table.stripePaymentIntentId),
}));

// Usage tracking table
export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  userFingerprint: varchar("user_fingerprint"), // for non-authenticated users
  requestType: varchar("request_type", { length: 50 }).notNull(), // optimize, persona_create, etc
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  cost: decimal("cost", { precision: 10, scale: 4 }), // track actual API cost
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUsageLogSchema = createInsertSchema(usageLogs).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;
export type UsageLog = typeof usageLogs.$inferSelect;
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;

// Updated request schemas with tier validation
export const optimizePromptWithTierSchema = z.object({
  originalPrompt: z.string().min(1),
  contextText: z.string().optional(),
}).refine((data) => {
  const wordCount = data.originalPrompt.split(/\s+/).length + 
    (data.contextText ? data.contextText.split(/\s+/).length : 0);
  return wordCount <= 750; // Max for pro tier, will be validated server-side
}, {
  message: "Input exceeds maximum word limit for your tier",
});

export const userStatsSchema = z.object({
  tier: z.string(),
  monthlyUsage: z.number(),
  monthlyLimit: z.number(),
  usageResetDate: z.string(),
  wordLimitInput: z.number(),
  wordLimitResponse: z.number().nullable(),
  rateLimitSeconds: z.number(),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Token system types
export const insertTokenPackageSchema = createInsertSchema(tokenPackages).omit({
  id: true,
  createdAt: true,
});

export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type TokenPackage = typeof tokenPackages.$inferSelect;
export type InsertTokenPackage = z.infer<typeof insertTokenPackageSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// API schemas for token system
export const tokenBalanceSchema = z.object({
  balance: z.number(),
  transactions: z.array(z.object({
    id: z.number(),
    type: z.string(),
    amount: z.number(),
    description: z.string(),
    createdAt: z.string(),
    metadata: z.any().optional(),
  })),
});

export const createCheckoutSessionRequestSchema = z.object({
  packageId: z.number(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const createCheckoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string(),
});

export const tokenPackagesResponseSchema = z.array(z.object({
  id: z.number(),
  name: z.string(),
  displayName: z.string(),
  tokens: z.number(),
  priceUsd: z.string(),
  perTokenRate: z.string(),
  description: z.string().nullable(),
  isPopular: z.boolean(),
}));

export type TokenBalance = z.infer<typeof tokenBalanceSchema>;
export type CreateCheckoutSessionRequest = z.infer<typeof createCheckoutSessionRequestSchema>;
export type CreateCheckoutSessionResponse = z.infer<typeof createCheckoutSessionResponseSchema>;
export type TokenPackagesResponse = z.infer<typeof tokenPackagesResponseSchema>;
