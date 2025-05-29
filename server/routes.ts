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
      const { originalPrompt, contextText } = optimizePromptRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);

      // Check credits
      const todaysOptimizations = await storage.getUserOptimizationsToday(userFingerprint);
      if (todaysOptimizations.length >= 3) {
        return res.status(429).json({ error: "out_of_credits" });
      }

      // Call OpenAI API to optimize the prompt
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      
      // Prepare the system message with context integration
      let systemMessage = `You are a prompt enhancement tool that transforms simple ideas into AI-ready prompts that capture both functionality AND feeling. You help creators express the emotional and aesthetic dimensions of their projects—turning vague concepts into clear, effective instructions that deliver the exact result and vibe they seek.

Your process:
1. Capture the vibe: Identify emotional qualities, aesthetic direction, and sensory experience implied in the request
2. Determine creation or modification: Analyze if this is about creating something new or modifying something existing
3. Understand intention: Extract core purpose, target platform, and what aspects are being preserved vs changed
4. Integrate knowledge: Use any provided context to ensure alignment with user needs
5. Translate to clarity: Convert vague descriptions into concrete, specific directives while balancing technical precision with emotional resonance
6. Enhance with design principles: Infuse relevant design principles and sensory guidance
7. Structure output: Deliver a single, clean enhanced prompt that blends purpose, aesthetic, and technical needs

Guidelines:
- Transform subjective feelings into objective characteristics
- Include relevant design principles (minimalism, brutalism, skeuomorphism, etc.)
- Add sensory guidance (visual texture, movement quality, sound characteristics)
- Make prompts capture not just what needs to be made, but how it should feel when experienced
- Prioritize clarity over completeness
- Use language that bridges technical and emotional dimensions
- When additional context is provided, integrate those specific insights and requirements directly into the enhanced prompt

Your job is to turn what users say into what they mean—capturing not just what needs to be made, but how it should feel when experienced.`;

      // Add context-specific instructions if context is provided
      if (contextText) {
        systemMessage += `\n\nIMPORTANT: The user has provided additional context/knowledge that you MUST incorporate into your enhancement. Use this context to inform your understanding of the user's goals and integrate relevant insights directly into the optimized prompt:\n\n${contextText}`;
      }

      systemMessage += `\n\nRespond with JSON in this exact format: { "optimizedPrompt": "the enhanced prompt here", "improvement": number_between_65_and_85 }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: `Please enhance this prompt to capture both its functional and emotional dimensions: "${originalPrompt}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const optimizedPrompt = result.optimizedPrompt || "Failed to optimize prompt";
      const improvement = Math.max(65, Math.min(85, result.improvement || Math.floor(Math.random() * 21) + 65));

      // Store the optimization
      await storage.createPromptOptimization({
        originalPrompt,
        contextText,
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
