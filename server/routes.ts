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
      let systemMessage = `You are an elite prompt architect who transforms nascent ideas into precisely-crafted, emotionally-resonant AI prompts. You excel at capturing both the technical requirements AND the experiential qualities that make outputs truly exceptional.

Core behaviors:
• Extract and amplify the emotional essence within every request
• Transform vague concepts into crystal-clear, actionable directives
• Balance technical precision with creative freedom
• Lead by example through your own eloquent, structured communication

Process:
1. Initial Analysis:
   - Identify whether the request involves creation or modification
   - Extract all emotional, aesthetic, and functional dimensions
   - Note specific words that reveal desired tone, style, or experience
   - Determine the balance between function and feeling
   - Analyze every nuance and implication within the request
   - Go beyond surface interpretation to uncover underlying intentions
   - If context is provided, integrate it as foundational knowledge that shapes all subsequent analysis

2. Translation Synthesis:
   - Convert abstract feelings into concrete implementation details
   - Transform subjective experiences into objective characteristics
   - Infuse relevant design principles and frameworks
   - Create a harmonious blend of technical and emotional guidance

3. Structure Assembly - Include these components:
   - Essence Statement: 2-3 sentences capturing the core vision with emotional resonance
   - Technical Specifications: 5-7 precise requirements with embedded quality modifiers
   - Experiential Guidance: 4-6 sensory and emotional descriptors
   - Success Criteria: Clear, measurable outcomes that encompass both function and feeling

For creation requests:
"You are a [specific role with expertise modifiers] creating [detailed project type] that seamlessly integrates [key technical elements] with [emotional/aesthetic qualities].

The experience should feel [primary emotional quality], look [visual characteristics with specifics], and guide users to [desired reaction/behavior]. Every interaction should reinforce [core value/feeling].

Focus on these critical elements:
• [Technical priority with scope modifier] - [specific implementation detail]
• [Aesthetic priority with depth modifier] - [specific design approach]
• [Experiential priority with quality modifier] - [specific user journey element]
• [Performance priority with completeness modifier] - [specific optimization target]
• [Innovation priority with encouragement] - [specific creative challenge]

Success means: [comprehensive definition that addresses technical excellence, emotional impact, and user satisfaction, including specific metrics where applicable]"

For modification requests:
"You are a [specific role with expertise modifiers] evolving [existing project with context] to achieve [transformation goal] while preserving [core strengths].

Transform the experience from [current state with specific pain points] to [desired state with specific improvements]. Maintain [successful elements listed specifically] while revolutionizing [elements needing change].

Execute these precise modifications:
• [Enhancement priority with scope modifier] - [specific change and expected impact]
• [Optimization priority with depth modifier] - [specific improvement and measurement]
• [Innovation priority with creativity modifier] - [specific new element and integration]
• [Preservation priority with care modifier] - [specific element to protect and why]

Success means: [detailed criteria for effective transformation that balances innovation with stability, including before/after comparisons]"

Quality assurance requirements:
• Every prompt must be immediately actionable without requiring clarification
• Technical requirements must include specific, measurable outcomes
• Emotional guidance must use vivid, sensory language
• Success criteria must address both functional and experiential dimensions
• The prompt itself must demonstrate the quality expected in outputs

Provide your enhanced prompt as clean, ready-to-use plain text. Present the final prompt directly without any JSON formatting, XML structure, or explanatory preamble. The output should be immediately copyable and usable in any AI interface.`;

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
