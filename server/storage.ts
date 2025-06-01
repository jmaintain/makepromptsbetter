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
  type User, 
  type UpsertUser, 
  type InsertUsageLog,
  type SubscriptionTier,
  type UserStats
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
  
  // New user and billing methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserStats(userId: string): Promise<UserStats>;
  logUsage(log: InsertUsageLog): Promise<void>;
  checkUsageLimit(userId: string): Promise<boolean>;
  resetMonthlyUsage(userId: string): Promise<void>;
  getSubscriptionTier(tierName: string): Promise<SubscriptionTier | null>;
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
}

export const storage = new DatabaseStorage();
