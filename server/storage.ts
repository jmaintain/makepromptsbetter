import { promptOptimizations, type PromptOptimization, type InsertPromptOptimization, type Persona, type InsertPersona } from "@shared/schema";

export interface IStorage {
  createPromptOptimization(optimization: InsertPromptOptimization): Promise<PromptOptimization>;
  getUserOptimizationsToday(userFingerprint: string): Promise<PromptOptimization[]>;
  createPersona(persona: InsertPersona): Promise<Persona>;
  getPersona(id: number): Promise<Persona | null>;
  getUserPersonasToday(userFingerprint: string): Promise<Persona[]>;
  updatePersona(id: number, updates: Partial<Persona>): Promise<Persona>;
}

export class MemStorage implements IStorage {
  private optimizations: Map<number, PromptOptimization>;
  private personas: Map<number, Persona>;
  private currentId: number;
  private currentPersonaId: number;

  constructor() {
    this.optimizations = new Map();
    this.personas = new Map();
    this.currentId = 1;
    this.currentPersonaId = 1;
  }

  // Method to reset storage for development
  reset() {
    this.optimizations = new Map();
    this.personas = new Map();
    this.currentId = 1;
    this.currentPersonaId = 1;
  }

  async createPromptOptimization(insertOptimization: InsertPromptOptimization): Promise<PromptOptimization> {
    const id = this.currentId++;
    const optimization: PromptOptimization = {
      ...insertOptimization,
      contextText: insertOptimization.contextText || null,
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

  async createPersona(insertPersona: InsertPersona): Promise<Persona> {
    const id = this.currentPersonaId++;
    const persona: Persona = {
      id,
      name: insertPersona.name,
      originalInput: insertPersona.originalInput,
      generatedPersona: insertPersona.generatedPersona,
      enhancementResponses: insertPersona.enhancementResponses || null,
      userFingerprint: insertPersona.userFingerprint,
      phase: insertPersona.phase || "1",
      createdAt: new Date(),
    };
    
    this.personas.set(id, persona);
    return persona;
  }

  async getPersona(id: number): Promise<Persona | null> {
    return this.personas.get(id) || null;
  }

  async getUserPersonasToday(userFingerprint: string): Promise<Persona[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.personas.values()).filter(
      persona => persona.userFingerprint === userFingerprint && 
                 persona.createdAt >= today
    );
  }

  async updatePersona(id: number, updates: Partial<Persona>): Promise<Persona> {
    const existing = this.personas.get(id);
    if (!existing) {
      throw new Error(`Persona with id ${id} not found`);
    }
    
    const updated = { ...existing, ...updates };
    this.personas.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
