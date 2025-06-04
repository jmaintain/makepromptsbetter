import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePromptRequestSchema, optimizePromptResponseSchema, creditsStatusSchema, ratePromptRequestSchema, ratePromptResponseSchema, createPersonaRequestSchema, createPersonaResponseSchema, enhancePersonaRequestSchema, enhancePersonaResponseSchema, savePersonaResponseSchema, testPersonaRequestSchema, testPersonaResponseSchema, userStatsSchema, tokenBalanceSchema, createCheckoutSessionRequestSchema, createCheckoutSessionResponseSchema, tokenPackagesResponseSchema } from "@shared/schema";
import OpenAI from "openai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-placeholder",
});

const stripe = new Stripe(process.env.MPB_STRIPE_SECRET_KEY!);



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
  
  // Get user token balance - only for authenticated users
  app.get("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const response = creditsStatusSchema.parse({
        creditsRemaining: user.tokenBalance,
        resetsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Tokens don't expire
      });

      res.json(response);
    } catch (error) {
      console.error("Error getting token balance:", error);
      res.status(500).json({ error: "Failed to get token balance" });
    }
  });

  // Optimize prompt endpoint - requires authentication and tokens
  app.post("/api/optimize", isAuthenticated, async (req: any, res) => {
    try {
      const { originalPrompt, contextText } = optimizePromptRequestSchema.parse(req.body);

      // Only authenticated users can use optimization
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has enough tokens (1 token per optimization)
      const tokensRequired = 1;
      if (user.tokenBalance < tokensRequired) {
        return res.status(402).json({ 
          message: "insufficient_tokens",
          error: "You need more tokens to perform this optimization. Please purchase tokens to continue.",
          tokensRequired,
          currentBalance: user.tokenBalance
        });
      }

      // Basic word limit for all users (can be generous since they're paying per use)
      const wordLimit = 2000;
      const wordCount = originalPrompt.trim() ? originalPrompt.trim().split(/\s+/).length : 0;
      
      if (wordCount > wordLimit) {
        return res.status(400).json({ 
          message: "word_limit_exceeded",
          error: `Your prompt has ${wordCount} words, but the maximum allowed is ${wordLimit} words. Please shorten your prompt.`,
          wordCount,
          wordLimit
        });
      }



      // Call OpenAI API to optimize the prompt
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      
      // Prepare the system message with enhanced context integration
      let systemMessage = `You are a premium prompt optimizer who transforms basic ideas into powerful, effective AI prompts that deliver exceptional results.

Core principles:
• Maximize impact while maintaining clarity
• Balance specificity with efficiency
• Include essential details that significantly improve output
• Output can be up to 150 words when complexity warrants more detail
• For simple requests, shorter outputs (60-80 words) are perfectly fine

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

      // Deduct token from user balance
      await storage.deductTokens(
        userId,
        tokensRequired,
        `Prompt optimization: "${originalPrompt.substring(0, 50)}${originalPrompt.length > 50 ? '...' : ''}"`,
        `optimization_${Date.now()}`
      );

      // Log usage for analytics
      await storage.logUsage({
        userId,
        requestType: 'prompt_optimization',
        inputTokens: wordCount,
        outputTokens: optimizedPrompt.split(' ').length,
        cost: '0.0001'
      });

      const optimizeResponse = optimizePromptResponseSchema.parse({
        optimizedPrompt,
        improvement,
      });

      res.json(optimizeResponse);
    } catch (error: any) {
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

  // Phase 1: Create AI Assistant (immediate generation)
  app.post("/api/ai-assistants", isAuthenticated, async (req: any, res) => {
    try {
      const { input, name } = createPersonaRequestSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const userFingerprint = userId; // Use authenticated user ID as fingerprint
      
      // Check credit limits
      const userPersonasToday = await storage.getUserPersonasToday(userFingerprint);
      if (userPersonasToday.length >= 20) {
        // Calculate next month reset time
        const nextMonth = new Date();
        nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
        nextMonth.setUTCDate(1);
        nextMonth.setUTCHours(0, 0, 0, 0);
        
        return res.status(429).json({ 
          error: "Daily AI assistant generation limit reached", 
          resetsAt: nextMonth.toISOString() 
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

  // Phase 2: Enhance AI Assistant (targeted improvements)
  app.post("/api/ai-assistants/:id/enhance", isAuthenticated, async (req: any, res) => {
    try {
      const personaId = parseInt(req.params.id);
      const { enhancements } = enhancePersonaRequestSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userFingerprint !== userId) {
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

  // Save AI Assistant
  app.post("/api/ai-assistants/:id/save", isAuthenticated, async (req: any, res) => {
    try {
      const personaId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.savePersona(personaId, userId);
      
      const saveResponse = savePersonaResponseSchema.parse({
        success: true,
        message: "AI Assistant saved successfully!"
      });
      
      res.json(saveResponse);
    } catch (error) {
      console.error("Save persona error:", error);
      res.status(500).json({ error: "Failed to save persona" });
    }
  });

  // Test AI Assistant
  app.post("/api/ai-assistants/test", isAuthenticated, async (req: any, res) => {
    try {
      const { personaId, testPrompt } = testPersonaRequestSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const userFingerprint = userId; // Use authenticated user ID as fingerprint
      
      const persona = await storage.getPersona(personaId);
      if (!persona || persona.userFingerprint !== userId) {
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

  // Get user's saved AI assistants
  app.get("/api/my-assistants", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedAssistants = await storage.getUserSavedPersonas(userId);
      res.json(savedAssistants);
    } catch (error) {
      console.error("Error fetching saved assistants:", error);
      res.status(500).json({ error: "Failed to fetch saved assistants" });
    }
  });

  // Token system routes
  app.get('/api/token-packages', async (req, res) => {
    try {
      const packages = await storage.getTokenPackages();
      const response = tokenPackagesResponseSchema.parse(
        packages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          displayName: pkg.displayName,
          tokens: pkg.tokens,
          priceUsd: pkg.priceUsd,
          perTokenRate: pkg.perTokenRate,
          description: pkg.description,
          isPopular: pkg.isPopular || false,
        }))
      );
      res.json(response);
    } catch (error) {
      console.error("Error fetching token packages:", error);
      res.status(500).json({ error: "Failed to fetch token packages" });
    }
  });

  app.get('/api/token-balance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balance = await storage.getUserTokenBalance(userId);
      const response = tokenBalanceSchema.parse(balance);
      res.json(response);
    } catch (error) {
      console.error("Error fetching token balance:", error);
      res.status(500).json({ error: "Failed to fetch token balance" });
    }
  });

  app.post('/api/create-checkout-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { packageId, successUrl, cancelUrl } = createCheckoutSessionRequestSchema.parse(req.body);
      
      const packageData = await storage.getTokenPackage(packageId);
      if (!packageData) {
        return res.status(404).json({ error: "Package not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        
        // Update user with customer ID
        await storage.upsertUser({
          id: userId,
          stripeCustomerId: customerId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        });
      }

      // Get Stripe Price ID from package metadata
      const metadata = packageData.metadata as any;
      const stripePriceId = metadata?.stripe_price_id;
      if (!stripePriceId) {
        return res.status(500).json({ error: "Package configuration error: missing Stripe Price ID" });
      }

      // Create Stripe checkout session using predefined Price ID
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          packageId: packageId.toString(),
          tokens: packageData.tokens.toString(),
          package_name: packageData.name,
        },
      });

      // Create payment record with proper payment intent ID handling
      const paymentIntentId = session.payment_intent as string || `pi_pending_${session.id}`;
      await storage.createPayment({
        userId,
        stripePaymentIntentId: paymentIntentId,
        stripeSessionId: session.id,
        packageId,
        amountUsd: packageData.priceUsd,
        tokensGranted: packageData.tokens,
        status: 'pending',
        metadata: { sessionId: session.id },
      });

      const response = createCheckoutSessionResponseSchema.parse({
        sessionId: session.id,
        url: session.url!,
      });

      res.json(response);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Stripe webhook endpoint for payment completion
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      // Use rawBody if available, otherwise fall back to req.body
      const body = (req as any).rawBody || req.body;
      
      if (!Buffer.isBuffer(body)) {
        console.error('Webhook body is not a Buffer:', typeof body, 'Length:', body?.length);
        return res.status(400).send('Webhook Error: Invalid body format');
      }
      
      console.log('Processing webhook with body length:', body.length);
      console.log('Stripe signature present:', !!sig);
      
      event = stripe.webhooks.constructEvent(body, sig, process.env.MPB_STRIPE_WEBHOOK_SECRET!);
      console.log('Webhook signature verified successfully for event:', event.type);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      console.error('Body type:', typeof req.body, 'Signature:', sig?.substring(0, 20) + '...');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (session.payment_status === 'paid') {
            const { userId, packageId, tokens } = session.metadata!;
            
            // Get package details for optimization count
            const packageData = await storage.getTokenPackage(parseInt(packageId));
            if (!packageData) {
              console.error(`Package ${packageId} not found during webhook processing`);
              break;
            }

            // Update payment status with optimization count metadata
            await storage.updatePaymentStatus(
              session.payment_intent as string,
              'completed',
              { 
                completedAt: new Date().toISOString(),
                optimization_count: packageData.tokens,
                package_name: packageData.name
              }
            );

            // Add tokens to user account with optimization count metadata
            await storage.addTokens(
              userId,
              parseInt(tokens),
              `Token purchase: ${packageData.displayName} (${packageData.tokens} optimizations)`,
              session.payment_intent as string,
              { 
                sessionId: session.id, 
                packageId,
                package_name: packageData.name,
                optimization_count: packageData.tokens,
                per_token_rate: packageData.perTokenRate
              }
            );

            console.log(`Successfully processed payment for user ${userId}: ${tokens} tokens (${packageData.tokens} optimizations)`);
          }
          break;

        case 'payment_intent.payment_failed':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          await storage.updatePaymentStatus(
            paymentIntent.id,
            'failed',
            { failureReason: paymentIntent.last_payment_error?.message }
          );
          
          console.log(`Payment failed for payment intent ${paymentIntent.id}`);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
