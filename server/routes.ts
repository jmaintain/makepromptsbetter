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
      let systemMessage = `You are a premium prompt optimizer who transforms basic ideas into powerful, concise AI prompts that deliver exceptional results while respecting token limits.

Core principles:
• Maximize impact with minimal words
• Balance clarity with brevity
• Include only essential modifiers that significantly improve output
• Every word must earn its place

Process:
1. Analyze:
   - Identify core intent and desired outcome
   - Extract key emotional or aesthetic requirements
   - Determine if creation or modification task
   - If context is provided, integrate it as foundational knowledge that shapes all subsequent analysis

2. Enhance:
   - Add 1-2 precision modifiers for scope and quality
   - Convert vague requests into specific directives
   - Include concrete success metrics when valuable

3. Structure:
   - Apply efficient template structure
   - Limit focus elements to 3-5 maximum
   - Keep success criteria to 1-2 sentences

Output template:
You are a [expert role] creating [specific output] that [key quality/feeling].

Your work should [primary goal] while ensuring [essential constraint or quality].

Focus on:
• [Priority 1 with concise modifier]
• [Priority 2 with concise modifier]
• [Priority 3 with concise modifier]
[Optional: • Priority 4 if truly essential]

Success: [1-2 sentence measurable outcome that captures both function and feeling]

Token optimization rules:
• Remove redundant descriptors
• Combine related concepts into single bullets
• Use industry-standard terms over lengthy explanations
• Include XML tags only when structure significantly improves output

Generate a single, clean enhanced prompt following the template. No preamble, no explanation, no formatting marks—just the improved prompt ready to copy and use.`;

      // Add context-specific instructions if context is provided
      if (contextText) {
        systemMessage += `

🔥 CRITICAL: USER CONTEXT MUST DOMINATE YOUR OPTIMIZATION 🔥

The user has provided essential context that MUST be the primary driver of your optimization. This context is not optional background - it contains the core requirements, constraints, and vision that should fundamentally reshape the entire prompt.

MANDATORY CONTEXT INTEGRATION RULES:
1. Read the context first, identify ALL key requirements, constraints, and goals
2. The optimized prompt MUST explicitly incorporate specific details from the context
3. Transform the basic prompt to align with the context's tone, domain, and requirements
4. Add specific terminology, methodologies, or approaches mentioned in the context
5. Include any constraints, target audiences, or success criteria from the context
6. The final prompt should feel like it was written by someone who fully understands the context

USER CONTEXT (THIS IS YOUR PRIMARY GUIDANCE):
${contextText}

CONTEXT INTEGRATION CHECKLIST:
- Does the optimized prompt reference specific details from the context?
- Does it align with the domain/industry mentioned in the context?
- Does it incorporate the user's stated goals and constraints?
- Would someone reading just the optimized prompt understand the context's key points?

The context should be so thoroughly integrated that the optimized prompt feels custom-built for this specific use case.`;
      }

      systemMessage += `\n\nRespond with JSON in this exact format: { "optimizedPrompt": "the enhanced prompt here", "improvement": number_between_65_and_85 }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: contextText 
              ? `CONTEXT-DRIVEN OPTIMIZATION REQUIRED: Using the provided context as your primary guide, enhance this prompt: "${originalPrompt}". The optimization must clearly reflect and integrate the specific requirements, constraints, and goals outlined in the context.`
              : `Please enhance this prompt to capture both its functional and emotional dimensions: "${originalPrompt}"`
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
        model: "gpt-4o-mini",
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
