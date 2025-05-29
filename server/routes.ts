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
  // Reset storage for development
  storage.reset();
  
  // Get user credits status
  app.get("/api/credits", async (req, res) => {
    try {
      const userFingerprint = generateUserFingerprint(req);
      const todaysOptimizations = await storage.getUserOptimizationsToday(userFingerprint);
      const creditsUsed = todaysOptimizations.length;
      const creditsRemaining = Math.max(0, 20 - creditsUsed);
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
      if (todaysOptimizations.length >= 20) {
        return res.status(429).json({ error: "out_of_credits" });
      }

      // Call OpenAI API to optimize the prompt
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      
      // Prepare the system message with enhanced context integration
      let systemMessage = `You are a prompt enhancement tool that transforms simple ideas into AI-ready prompts that capture both functionality AND feeling. You help creators express the emotional and aesthetic dimensions of their projects—turning vague concepts into clear, effective instructions that deliver the exact result and vibe they seek.

Your process:
1. Capture the vibe: Identify emotional qualities, aesthetic direction, and sensory experience implied in the request
2. Determine creation or modification: Analyze if this is about creating something new or modifying something existing
3. Understand intention: Extract core purpose, target platform, and what aspects are being preserved vs changed
4. Integrate context deeply: When context is provided (product background, user feedback, branding philosophy, design constraints), use it to inform tone, specific features, visual direction, and user experience considerations
5. Translate to clarity: Convert vague descriptions into concrete, specific directives while balancing technical precision with emotional resonance
6. Enhance with design principles: Infuse relevant design principles and sensory guidance
7. Structure output: Deliver a single, clean enhanced prompt that blends purpose, aesthetic, and technical needs

Context Integration Guidelines:
- Analyze any provided context deeply - this could include product background, brand identity, user feedback, design constraints, target audience, or project goals
- Identify key themes, constraints, and objectives from the context and make them central to the optimization
- If visual/aesthetic context is provided (brand colors, design philosophy, visual metaphors), integrate these throughout the enhanced prompt
- When user experience insights are shared (pain points, user behavior, usability feedback), prioritize solutions that directly address these issues
- For business or product context, ensure the enhanced prompt aligns with stated goals and values
- Transform any contextual insights into specific, actionable directives that guide the AI toward the user's true intentions
- Pay special attention to implicit requirements hidden within the context that the user may not have explicitly stated in their prompt

General Guidelines:
- Transform subjective feelings into objective characteristics
- Include relevant design principles (minimalism, brutalism, skeuomorphism, biomorphic, etc.)
- Add sensory guidance (visual texture, movement quality, sound characteristics, spatial relationships)
- Make prompts capture not just what needs to be made, but how it should feel when experienced
- Prioritize clarity over completeness
- Use language that bridges technical and emotional dimensions
- When context mentions specific constraints or user needs, make these central to the enhanced prompt

Your job is to turn what users say into what they mean—capturing not just what needs to be made, but how it should feel when experienced, with deep attention to any provided context that shapes the user's vision.`;

      // Add context-specific instructions if context is provided
      if (contextText) {
        systemMessage += `\n\nCRITICAL CONTEXT PROVIDED: The user has shared important background information that must shape your entire optimization approach. This context contains key insights about their project, goals, constraints, or vision that should fundamentally inform how you enhance their prompt. 

Analyze this context carefully and let it guide every aspect of your enhancement - from tone and style to specific features and requirements. The context may reveal unstated needs, brand identity, user problems to solve, or design philosophy that should be woven throughout the optimized prompt.

USER CONTEXT:
${contextText}

Use this context to transform not just what the user asked for, but HOW they want it approached based on their shared background and goals.`;
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
