import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePromptRequestSchema, optimizePromptResponseSchema, creditsStatusSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-placeholder",
});

function generateUserFingerprint(req: any): string {
  // Simple fingerprinting based on IP and user agent
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const userAgent = req.get("User-Agent") || "unknown";
  return Buffer.from(`${ip}:${userAgent}`).toString("base64");
}

function getCreditsResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user credits status
  app.get("/api/credits", async (req, res) => {
    try {
      const userFingerprint = generateUserFingerprint(req);
      const todaysOptimizations = await storage.getUserOptimizationsToday(userFingerprint);
      const creditsUsed = todaysOptimizations.length;
      const creditsRemaining = Math.max(0, 3 - creditsUsed);
      const resetsAt = getCreditsResetTime().toISOString();

      const response = creditsStatusSchema.parse({
        creditsRemaining,
        resetsAt,
      });

      res.json(response);
    } catch (error) {
      console.error("Error getting credits:", error);
      res.status(500).json({ error: "Failed to get credits status" });
    }
  });

  // Optimize prompt endpoint
  app.post("/api/optimize", async (req, res) => {
    try {
      const { originalPrompt } = optimizePromptRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);

      // Check credits
      const todaysOptimizations = await storage.getUserOptimizationsToday(userFingerprint);
      if (todaysOptimizations.length >= 3) {
        return res.status(429).json({ error: "out_of_credits" });
      }

      // Call OpenAI API to optimize the prompt
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert prompt engineer. Your task is to take a user's vague or basic prompt and transform it into a highly effective, detailed prompt that will get better results from AI systems.

Guidelines for optimization:
- Make prompts more specific and actionable
- Add relevant context and constraints
- Include output format specifications
- Add role-playing elements when appropriate
- Specify tone, style, and length requirements
- Include examples or bullet points for clarity
- Make the prompt clear about what the AI should and shouldn't do

Respond with JSON in this exact format: { "optimizedPrompt": "the improved prompt here", "improvement": number_between_60_and_80 }`
          },
          {
            role: "user",
            content: `Please optimize this prompt: "${originalPrompt}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const optimizedPrompt = result.optimizedPrompt || "Failed to optimize prompt";
      const improvement = Math.max(60, Math.min(80, result.improvement || Math.floor(Math.random() * 21) + 60));

      // Store the optimization
      await storage.createPromptOptimization({
        originalPrompt,
        optimizedPrompt,
        improvement,
        userFingerprint,
      });

      const optimizeResponse = optimizePromptResponseSchema.parse({
        optimizedPrompt,
        improvement,
      });

      res.json(optimizeResponse);
    } catch (error) {
      console.error("Error optimizing prompt:", error);
      if (error.message?.includes("rate limit") || error.status === 429) {
        return res.status(429).json({ error: "rate_limit_exceeded" });
      }
      res.status(500).json({ error: "Failed to optimize prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
