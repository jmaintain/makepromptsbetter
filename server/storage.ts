import { promptOptimizations, type PromptOptimization, type InsertPromptOptimization } from "@shared/schema";

export interface IStorage {
  createPromptOptimization(optimization: InsertPromptOptimization): Promise<PromptOptimization>;
  getUserOptimizationsToday(userFingerprint: string): Promise<PromptOptimization[]>;
}

export class MemStorage implements IStorage {
  private optimizations: Map<number, PromptOptimization>;
  private currentId: number;

  constructor() {
    this.optimizations = new Map();
    this.currentId = 1;
  }

  async createPromptOptimization(insertOptimization: InsertPromptOptimization): Promise<PromptOptimization> {
    const id = this.currentId++;
    const optimization: PromptOptimization = {
      ...insertOptimization,
      id,
      createdAt: new Date(),
    };
    this.optimizations.set(id, optimization);
    return optimization;
  }

  async getUserOptimizationsToday(userFingerprint: string): Promise<PromptOptimization[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.optimizations.values()).filter(
      (opt) => opt.userFingerprint === userFingerprint && opt.createdAt >= today
    );
  }
}

export const storage = new MemStorage();
