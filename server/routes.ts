import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePromptRequestSchema, optimizePromptResponseSchema, creditsStatusSchema, ratePromptRequestSchema, ratePromptResponseSchema, createPersonaRequestSchema, createPersonaResponseSchema, enhancePersonaRequestSchema, enhancePersonaResponseSchema, savePersonaResponseSchema, testPersonaRequestSchema, testPersonaResponseSchema, userStatsSchema } from "@shared/schema";
import OpenAI from "openai";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user stats (usage, limits, etc.)
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  
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

  // Optimize prompt endpoint with word limits and usage tracking
  app.post("/api/optimize", async (req, res) => {
    try {
      const { originalPrompt, contextText } = optimizePromptRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);

      // Check if user is authenticated for tier-based limits
      let wordLimit = 200; // Default for unauthenticated users
      let userId: string | null = null;
      
      if (req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims.sub;
        const userStats = await storage.getUserStats(userId);
        
        // Set word limit based on tier
        switch (userStats.tier) {
          case 'pro': wordLimit = 500; break;
          case 'starter': wordLimit = 300; break;
          default: wordLimit = 200; break;
        }

        // Check if user has exceeded monthly usage limit
        const hasUsageLeft = await storage.checkUsageLimit(userId);
        if (!hasUsageLeft) {
          return res.status(429).json({ 
            message: "monthly_limit_exceeded",
            error: "You have reached your monthly usage limit. Please upgrade or wait until next month." 
          });
        }
      }

      // Count words in the prompt
      const wordCount = originalPrompt.trim() ? originalPrompt.trim().split(/\s+/).length : 0;
      
      // Enforce word limit
      if (wordCount > wordLimit) {
        return res.status(400).json({ 
          message: "word_limit_exceeded",
          error: `Your prompt has ${wordCount} words, but your tier allows only ${wordLimit} words. Please shorten your prompt or upgrade your plan.`,
          wordCount,
          wordLimit
        });
      }

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

  // Phase 1: Create AI Persona (immediate generation)
  app.post("/api/personas", async (req, res) => {
    try {
      const { input, name } = createPersonaRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);
      
      // Check credit limits
      const userPersonasToday = await storage.getUserPersonasToday(userFingerprint);
      if (userPersonasToday.length >= 20) {
        return res.status(429).json({ 
          error: "Daily persona generation limit reached", 
          resetsAt: getCreditsResetTime().toISOString() 
        });
      }

      // Phase 1 system prompt for immediate persona generation
      const phase1SystemPrompt = `You are Persona Architect Pro in Hybrid Progressive Mode. You specialize in creating sophisticated AI personas through immediate value delivery.

INSTRUCTION: Generate a complete, functional AI persona from the user's input. Transform their basic task description into professional system instructions immediately. No confirmation needed - provide instant value.

OUTPUT STRUCTURE (use markdown formatting):
**AI ASSISTANT PERSONA: [Generated Name]**

**Core Mission**: [Clear, specific mission statement]

**Key Responsibilities**:
- [3-5 specific responsibilities with context]

**Expertise Domains**: [Primary areas of knowledge/skill]

**Problem-Solving Approach**: [Default methodology based on use case]

**Communication Style**: [Appropriate tone and formality for the role]

**Success Metrics**: [How to measure effectiveness]

BEHAVIOR: Always provide a complete, usable persona. Ensure all personas are actionable and include specific, realistic responsibilities and success metrics.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: phase1SystemPrompt
          },
          {
            role: "user",
            content: input
          }
        ],
      });

      const generatedPersona = response.choices[0].message.content || "Failed to generate persona";
      const personaName = name || input.split(' ').slice(0, 3).join(' ') + " Assistant";

      // Store the persona
      const persona = await storage.createPersona({
        name: personaName,
        originalInput: input,
        generatedPersona,
        enhancementResponses: null,
        userFingerprint,
        phase: "1",
      });

      const createResponse = createPersonaResponseSchema.parse({
        id: persona.id,
        name: persona.name,
        persona: persona.generatedPersona,
        canEnhance: userPersonasToday.length < 20, // Can enhance if under limit
      });

      res.json(createResponse);
    } catch (error) {
      console.error("Persona creation error:", error);
      res.status(500).json({ error: "Failed to create persona" });
    }
  });

  // Phase 2: Enhance Persona (targeted improvements)
  app.post("/api/personas/:id/enhance", async (req, res) => {
    try {
      const personaId = parseInt(req.params.id);
      const { enhancements } = enhancePersonaRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);
      
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userFingerprint !== userFingerprint) {
        return res.status(404).json({ error: "Persona not found" });
      }

      // Build enhancement context from user responses
      let enhancementContext = "ENHANCEMENT REQUESTS:\n";
      const changes: string[] = [];

      if (enhancements.communication) {
        const comm = enhancements.communication;
        if (comm.formality) {
          enhancementContext += `Communication Formality: ${comm.formality}\n`;
          changes.push("Communication style");
        }
        if (comm.responseLength) {
          enhancementContext += `Response Length Preference: ${comm.responseLength}\n`;
          changes.push("Response detail level");
        }
        if (comm.proactiveness) {
          enhancementContext += `Proactiveness Level: ${comm.proactiveness}\n`;
          changes.push("Proactive behavior");
        }
        if (comm.disagreementHandling) {
          enhancementContext += `Disagreement Handling: ${comm.disagreementHandling}\n`;
          changes.push("Disagreement approach");
        }
      }

      if (enhancements.expertise) {
        const exp = enhancements.expertise;
        if (exp.industryKnowledge) {
          enhancementContext += `Industry Knowledge: ${exp.industryKnowledge}\n`;
          changes.push("Industry expertise");
        }
        if (exp.commonMistakes) {
          enhancementContext += `Common Mistakes to Avoid: ${exp.commonMistakes}\n`;
          changes.push("Error prevention focus");
        }
        if (exp.technicalDepth) {
          enhancementContext += `Technical Depth Required: ${exp.technicalDepth}\n`;
          changes.push("Technical complexity");
        }
        if (exp.toolsIntegration) {
          enhancementContext += `Tools/Platforms Integration: ${exp.toolsIntegration}\n`;
          changes.push("Tool integration");
        }
      }

      if (enhancements.problemSolving) {
        const ps = enhancements.problemSolving;
        if (ps.creativeApproach) {
          enhancementContext += `Creative Problem Solving: ${ps.creativeApproach}\n`;
          changes.push("Creative methodology");
        }
        if (ps.analyticalDetail) {
          enhancementContext += `Analytical Detail Level: ${ps.analyticalDetail}\n`;
          changes.push("Analysis depth");
        }
        if (ps.urgencyHandling) {
          enhancementContext += `Urgency Handling: ${ps.urgencyHandling}\n`;
          changes.push("Priority management");
        }
        if (ps.uncertaintyResponse) {
          enhancementContext += `Uncertainty Response: ${ps.uncertaintyResponse}\n`;
          changes.push("Uncertainty handling");
        }
      }

      if (enhancements.context) {
        const ctx = enhancements.context;
        if (ctx.memoryPreferences) {
          enhancementContext += `Memory Preferences: ${ctx.memoryPreferences}\n`;
          changes.push("Memory management");
        }
        if (ctx.adaptationStyle) {
          enhancementContext += `Adaptation Style: ${ctx.adaptationStyle}\n`;
          changes.push("Adaptation approach");
        }
        if (ctx.progressTracking) {
          enhancementContext += `Progress Tracking: ${ctx.progressTracking}\n`;
          changes.push("Progress monitoring");
        }
      }

      const phase2SystemPrompt = `You are Persona Architect Pro in Enhancement Mode. Update the provided persona based on user enhancement preferences.

INSTRUCTION: Take the original persona and enhancement requests, then provide an updated persona that incorporates the requested improvements. Only modify sections that were enhanced, keeping the original structure intact.

Use the same markdown structure as the original persona. Highlight improvements naturally within the content.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: phase2SystemPrompt
          },
          {
            role: "user",
            content: `ORIGINAL PERSONA:\n${persona.generatedPersona}\n\n${enhancementContext}\n\nPlease update the persona to incorporate these enhancement requests.`
          }
        ],
      });

      const enhancedPersona = response.choices[0].message.content || persona.generatedPersona;

      // Update the persona
      await storage.updatePersona(personaId, {
        generatedPersona: enhancedPersona,
        enhancementResponses: JSON.stringify(enhancements),
        phase: "2",
      });

      const enhanceResponse = enhancePersonaResponseSchema.parse({
        persona: enhancedPersona,
        changes,
      });

      res.json(enhanceResponse);
    } catch (error) {
      console.error("Persona enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance persona" });
    }
  });

  // Save Persona
  app.post("/api/personas/:id/save", async (req, res) => {
    try {
      const personaId = parseInt(req.params.id);
      const userFingerprint = generateUserFingerprint(req);
      
      await storage.savePersona(personaId, userFingerprint);
      
      const saveResponse = savePersonaResponseSchema.parse({
        success: true,
        message: "Persona saved successfully!"
      });
      
      res.json(saveResponse);
    } catch (error) {
      console.error("Save persona error:", error);
      res.status(500).json({ error: "Failed to save persona" });
    }
  });

  // Test Persona
  app.post("/api/personas/test", async (req, res) => {
    try {
      const { personaId, testPrompt } = testPersonaRequestSchema.parse(req.body);
      const userFingerprint = generateUserFingerprint(req);
      
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userFingerprint !== userFingerprint) {
        return res.status(404).json({ error: "Persona not found" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: persona.generatedPersona
          },
          {
            role: "user",
            content: testPrompt
          }
        ],
      });

      const testResponse = testPersonaResponseSchema.parse({
        response: response.choices[0].message.content || "No response generated"
      });

      res.json(testResponse);
    } catch (error) {
      console.error("Test persona error:", error);
      res.status(500).json({ error: "Failed to test persona" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
