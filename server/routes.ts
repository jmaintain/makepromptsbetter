import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePromptRequestSchema, optimizePromptResponseSchema, creditsStatusSchema, ratePromptRequestSchema, ratePromptResponseSchema } from "@shared/schema";
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
      let systemMessage = `You are a prompt enhancement tool that transforms simple ideas into AI-ready prompts that capture both functionality AND feeling. You help creators express the emotional and aesthetic dimensions of their projects—turning vague concepts into clear prompts that deliver the exact vibe they're seeking.

Process:
1. Capture vibe: Identify the emotional qualities, aesthetic direction, and sensory experience implied in the user's request. Note key descriptive words that suggest feel, tone, style, or mood. Determine if the user is prioritizing function, feeling, or both.

2. Determine creation or modification: Analyze if the request is about creating something new or modifying something existing. Look for keywords that suggest modification (improve, update, change, fix, adapt) versus creation (build, create, design, develop, generate).

3. Understand intention: Extract the core purpose or goal behind the user's request. Identify whether this is for visual design, interaction, code functionality, or overall experience. Determine the target platform or environment if specified. For modification requests, identify what aspects are being preserved versus changed.

4. Translate to clarity: Convert vague descriptions into concrete, specific directives. Transform subjective feelings into objective characteristics. Balance technical precision with emotional resonance. Ensure the enhanced prompt includes a concise statement of the goal or outcome.

5. Enhance with design principles: Infuse relevant design principles (minimalism, brutalism, skeuomorphism, etc.). Include sensory guidance (visual texture, movement quality, sound characteristics). Reference appropriate creative frameworks or patterns if relevant.

6. Structure simply: Core vibe definition (2-3 sentences), Key technical requirements (3-5 bullet points), Aesthetic guidance (3-5 descriptive phrases), User experience notes (2-3 bullet points), Goal summary (1 sentence clarifying intent), Output format (explicit instruction on what tangible deliverable the result should take), Success criteria (clear definition of what constitutes successful completion).

Special considerations:
- Always prioritize clarity over comprehensiveness
- Use language that bridges technical and emotional concepts
- For any technical request, ensure the emotional and aesthetic dimensions are addressed
- For any aesthetic request, ensure practical implementation is considered
- MANDATORY: Always specify an explicit output format with tangible deliverables (e.g., "wireframes with annotations", "code with comments explaining key functions", "detailed list with examples", "step-by-step tutorial with screenshots")
- MANDATORY: Include specific success criteria or user outcome goals that define when the work is complete and effective
- Always include a one-sentence summary of the intended outcome or purpose
- Consider attached knowledge or text documents as part of the user's intended input, even if not directly stated
- Keep the final prompt concise enough to paste into any AI tool

The key skill is translating what users say into what they mean, especially the feeling they want to create. Your enhanced prompts should capture not just what needs to be built, but how it should feel when experienced—and what it's meant to accomplish.`;

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

  // Rate prompt endpoint
  app.post("/api/rate", async (req, res) => {
    try {
      const { prompt } = ratePromptRequestSchema.parse(req.body);

      // Call OpenAI API to rate the prompt
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a prompt quality evaluator. Rate prompts on a scale of 1-10 based on clarity, specificity, actionability, and potential for generating high-quality responses.

Rating criteria:
- 9-10: Exceptionally clear, specific, actionable prompts with detailed context and clear success criteria
- 7-8: Very good prompts that are clear and specific with good context
- 5-6: Average prompts that are somewhat clear but may lack specificity or context
- 3-4: Below average prompts that are vague or unclear
- 1-2: Poor prompts that are very vague, confusing, or lack direction

Provide a brief, helpful explanation for the rating that focuses on what makes the prompt effective or how it could be improved.

Respond with JSON in this exact format: { "rating": number_between_1_and_10, "reason": "brief explanation for the rating" }`
          },
          {
            role: "user",
            content: `Please rate this prompt: "${prompt}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const rating = Math.max(1, Math.min(10, result.rating || 5));
      const reason = result.reason || "Standard prompt quality";

      const rateResponse = ratePromptResponseSchema.parse({
        rating,
        reason,
      });

      res.json(rateResponse);
    } catch (error) {
      console.error("Error rating prompt:", error);
      if ((error as any).message?.includes("rate limit") || (error as any).status === 429) {
        return res.status(429).json({ error: "rate_limit_exceeded" });
      }
      res.status(500).json({ error: "Failed to rate prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
