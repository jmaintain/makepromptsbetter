import { 
  promptOptimizations, 
  type PromptOptimization, 
  type InsertPromptOptimization, 
  type Persona, 
  type InsertPersona, 
  personas,
  users, 
  usageLogs, 
  subscriptionTiers,
  tokenPackages,
  tokenTransactions,
  payments,
  type User, 
  type UpsertUser, 
  type InsertUsageLog,
  type SubscriptionTier,
  type UserStats,
  type TokenPackage,
  type InsertTokenPackage,
  type TokenTransaction,
  type InsertTokenTransaction,
  type Payment,
  type InsertPayment,
  type TokenBalance
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Existing methods
  createPromptOptimization(optimization: InsertPromptOptimization): Promise<PromptOptimization>;
  getUserOptimizationsToday(userFingerprint: string): Promise<PromptOptimization[]>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  getPersona(id: number): Promise<Persona | null>;
  getUserPersonasToday(userFingerprint: string): Promise<Persona[]>;
  updatePersona(id: number, updates: Partial<Persona>): Promise<Persona>;
  getUserSavedPersonas(userFingerprint: string): Promise<Persona[]>;
  savePersona(id: number, userFingerprint: string): Promise<Persona>;
  
  // User and billing methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserStats(userId: string): Promise<UserStats>;
  logUsage(log: InsertUsageLog): Promise<void>;
  checkUsageLimit(userId: string): Promise<boolean>;
  resetMonthlyUsage(userId: string): Promise<void>;
  getSubscriptionTier(tierName: string): Promise<SubscriptionTier | null>;
  
  // Token system methods
  getTokenPackages(): Promise<TokenPackage[]>;
  getTokenPackage(id: number): Promise<TokenPackage | null>;
  createTokenPackage(packageData: InsertTokenPackage): Promise<TokenPackage>;
  getUserTokenBalance(userId: string): Promise<TokenBalance>;
  deductTokens(userId: string, amount: number, description: string, referenceId?: string): Promise<TokenTransaction>;
  addTokens(userId: string, amount: number, description: string, referenceId?: string, metadata?: any): Promise<TokenTransaction>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(paymentIntentId: string, status: string, metadata?: any): Promise<Payment>;
  getPayment(paymentIntentId: string): Promise<Payment | null>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | null>;
  updatePaymentIntentId(sessionId: string, paymentIntentId: string): Promise<Payment | null>;
  getUserTransactionHistory(userId: string, limit?: number): Promise<TokenTransaction[]>;
  
  // Privacy and data retention methods
  deleteOldData(): Promise<{ deletedOptimizations: number; deletedPersonas: number; deletedUsageLogs: number }>;
  deleteUserData(userFingerprint: string): Promise<{ deletedOptimizations: number; deletedPersonas: number }>;
  anonymizeUserData(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
        },
      })
      .returning();
    return user;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const tier = await this.getSubscriptionTier(user.subscriptionTier);
    if (!tier) throw new Error("Subscription tier not found");

    return {
      tier: user.subscriptionTier,
      monthlyUsage: user.monthlyUsage,
      monthlyLimit: tier.monthlyPrompts,
      usageResetDate: user.usageResetDate,
      wordLimitInput: tier.inputWordLimit,
      wordLimitResponse: tier.responseWordLimit,
      rateLimitSeconds: tier.rateLimitSeconds,
    };
  }

  async logUsage(log: InsertUsageLog): Promise<void> {
    await db.insert(usageLogs).values(log);
    
    if (log.userId) {
      await db
        .update(users)
        .set({
          monthlyUsage: sql`${users.monthlyUsage} + 1`,
        })
        .where(eq(users.id, log.userId));
    }
  }

  async checkUsageLimit(userId: string): Promise<boolean> {
    const stats = await this.getUserStats(userId);
    return stats.monthlyUsage < stats.monthlyLimit;
  }

  async resetMonthlyUsage(userId: string): Promise<void> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
    
    await db
      .update(users)
      .set({
        monthlyUsage: 0,
        usageResetDate: nextMonthStr,
      })
      .where(eq(users.id, userId));
  }

  async getSubscriptionTier(tierName: string): Promise<SubscriptionTier | null> {
    const [tier] = await db
      .select()
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.name, tierName));
    return tier || null;
  }

  // Existing methods adapted for database
  async createPromptOptimization(optimization: InsertPromptOptimization): Promise<PromptOptimization> {
    const [result] = await db
      .insert(promptOptimizations)
      .values(optimization)
      .returning();
    return result;
  }

  async getUserOptimizationsToday(userFingerprint: string): Promise<PromptOptimization[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(promptOptimizations)
      .where(
        and(
          eq(promptOptimizations.userFingerprint, userFingerprint),
          gte(promptOptimizations.createdAt, today)
        )
      );
  }

  async createPersona(persona: InsertPersona): Promise<Persona> {
    const [result] = await db
      .insert(personas)
      .values(persona)
      .returning();
    return result;
  }

  async getPersona(id: number): Promise<Persona | null> {
    const [persona] = await db
      .select()
      .from(personas)
      .where(eq(personas.id, id));
    return persona || null;
  }

  async getUserPersonasToday(userFingerprint: string): Promise<Persona[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db
      .select()
      .from(personas)
      .where(
        and(
          eq(personas.userFingerprint, userFingerprint),
          gte(personas.createdAt, today)
        )
      );
  }

  async updatePersona(id: number, updates: Partial<Persona>): Promise<Persona> {
    const [updated] = await db
      .update(personas)
      .set(updates)
      .where(eq(personas.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Persona with id ${id} not found`);
    }
    
    return updated;
  }

  async getUserSavedPersonas(userFingerprint: string): Promise<Persona[]> {
    return await db
      .select()
      .from(personas)
      .where(
        and(
          eq(personas.userFingerprint, userFingerprint),
          eq(personas.isSaved, "true")
        )
      );
  }

  async savePersona(id: number, userFingerprint: string): Promise<Persona> {
    const persona = await this.getPersona(id);
    if (!persona) {
      throw new Error(`Persona with id ${id} not found`);
    }
    
    if (persona.userFingerprint !== userFingerprint) {
      throw new Error("You can only save your own personas");
    }
    
    return await this.updatePersona(id, { isSaved: "true" });
  }

  // Privacy and data retention methods
  async deleteOldData(): Promise<{ deletedOptimizations: number; deletedPersonas: number; deletedUsageLogs: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete old prompt optimizations
    const deletedOptimizations = await db
      .delete(promptOptimizations)
      .where(sql`${promptOptimizations.createdAt} < ${thirtyDaysAgo}`)
      .returning();

    // Delete old unsaved personas
    const deletedPersonas = await db
      .delete(personas)
      .where(
        and(
          sql`${personas.createdAt} < ${thirtyDaysAgo}`,
          eq(personas.isSaved, "false")
        )
      )
      .returning();

    // Delete old usage logs (keep for 90 days for billing purposes)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const deletedUsageLogs = await db
      .delete(usageLogs)
      .where(sql`${usageLogs.createdAt} < ${ninetyDaysAgo}`)
      .returning();

    return {
      deletedOptimizations: deletedOptimizations.length,
      deletedPersonas: deletedPersonas.length,
      deletedUsageLogs: deletedUsageLogs.length
    };
  }

  async deleteUserData(userFingerprint: string): Promise<{ deletedOptimizations: number; deletedPersonas: number }> {
    // Delete user's prompt optimizations
    const deletedOptimizations = await db
      .delete(promptOptimizations)
      .where(eq(promptOptimizations.userFingerprint, userFingerprint))
      .returning();

    // Delete user's personas
    const deletedPersonas = await db
      .delete(personas)
      .where(eq(personas.userFingerprint, userFingerprint))
      .returning();

    return {
      deletedOptimizations: deletedOptimizations.length,
      deletedPersonas: deletedPersonas.length
    };
  }

  async anonymizeUserData(userId: string): Promise<void> {
    // For registered users, we can anonymize rather than delete
    // Replace user fingerprints with anonymized versions in usage logs
    const anonymizedFingerprint = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db
      .update(usageLogs)
      .set({ userFingerprint: anonymizedFingerprint })
      .where(eq(usageLogs.userId, userId));
  }

  // Token system implementations
  async getTokenPackages(): Promise<TokenPackage[]> {
    return await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.isActive, true))
      .orderBy(tokenPackages.sortOrder);
  }

  async getTokenPackage(id: number): Promise<TokenPackage | null> {
    const [pkg] = await db
      .select()
      .from(tokenPackages)
      .where(and(eq(tokenPackages.id, id), eq(tokenPackages.isActive, true)));
    return pkg || null;
  }

  async createTokenPackage(packageData: InsertTokenPackage): Promise<TokenPackage> {
    const [pkg] = await db
      .insert(tokenPackages)
      .values(packageData)
      .returning();
    return pkg;
  }

  async getUserTokenBalance(userId: string): Promise<TokenBalance> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const recentTransactions = await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(sql`${tokenTransactions.createdAt} DESC`)
      .limit(20);

    return {
      balance: user.tokenBalance,
      transactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        metadata: t.metadata,
      })),
    };
  }

  async deductTokens(userId: string, amount: number, description: string, referenceId?: string): Promise<TokenTransaction> {
    return await db.transaction(async (tx) => {
      // Get current balance with row lock
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for("update");

      if (!user) throw new Error("User not found");
      if (user.tokenBalance < amount) throw new Error("Insufficient token balance");

      const newBalance = user.tokenBalance - amount;

      // Update user balance
      await tx
        .update(users)
        .set({ tokenBalance: newBalance })
        .where(eq(users.id, userId));

      // Record transaction
      const [transaction] = await tx
        .insert(tokenTransactions)
        .values({
          userId,
          type: "deduction",
          amount: -amount,
          description,
          referenceId,
          balanceAfter: newBalance,
        })
        .returning();

      return transaction;
    });
  }

  async addTokens(userId: string, amount: number, description: string, referenceId?: string, metadata?: any): Promise<TokenTransaction> {
    return await db.transaction(async (tx) => {
      // Get current balance with row lock
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for("update");

      if (!user) throw new Error("User not found");

      const newBalance = user.tokenBalance + amount;

      // Update user balance
      await tx
        .update(users)
        .set({ tokenBalance: newBalance })
        .where(eq(users.id, userId));

      // Record transaction
      const [transaction] = await tx
        .insert(tokenTransactions)
        .values({
          userId,
          type: "purchase",
          amount,
          description,
          referenceId,
          balanceAfter: newBalance,
          metadata,
        })
        .returning();

      return transaction;
    });
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(paymentIntentId: string, status: string, metadata?: any): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({
        status,
        metadata,
        completedAt: status === "completed" ? new Date() : null,
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntentId))
      .returning();

    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  async getPayment(paymentIntentId: string): Promise<Payment | null> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, paymentIntentId));
    return payment || null;
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | null> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeSessionId, sessionId));
    return payment || null;
  }

  async updatePaymentIntentId(sessionId: string, paymentIntentId: string): Promise<Payment | null> {
    const [payment] = await db
      .update(payments)
      .set({ stripePaymentIntentId: paymentIntentId })
      .where(eq(payments.stripeSessionId, sessionId))
      .returning();
    return payment || null;
  }

  async getUserTransactionHistory(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    return await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(sql`${tokenTransactions.createdAt} DESC`)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
