import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Target, Lightbulb, Code, FileText, Zap, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default function PromptSchool() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <Logo />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-brand-primary/10 p-4 rounded-2xl">
                <BookOpen className="w-12 h-12 text-brand-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4 font-title">
              Prompt School: Master the Art of AI Communication
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your AI interactions from basic to brilliant
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-12">
          
          {/* Why Better Prompts = Better Results */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Why Better Prompts = Better Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Think of prompting like giving directions. Saying "go to the store" might get someone there, but "go to the Whole Foods on Main Street, park in the back, and grab organic bananas from aisle 3" gets exactly what you need. The same principle applies to AI.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-4">The difference is dramatic:</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-red-700">Basic:</span>
                      <span className="text-gray-700"> "Write about productivity" → Generic, boring content</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-green-700">Better:</span>
                      <span className="text-gray-700"> "Write a personal story about how the Pomodoro Technique helped you finish your novel, including specific challenges and breakthroughs" → Engaging, unique content</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CLEAR Framework */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                The CLEAR Framework for Everyday Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Start with this simple framework for instant improvements:
              </p>
              
              <div className="grid md:grid-cols-1 gap-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      C
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Context - Set the scene</h3>
                      <p className="text-gray-600">Tell the AI what situation you're in or what background it needs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      L
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Lead by example - Show your style</h3>
                      <p className="text-gray-600">Write your prompt the way you want the AI to respond. Formal prompt = formal response.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      E
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Exact instructions - Be specific</h3>
                      <p className="text-gray-600">Replace vague requests with precise ones. "Many" → "at least 5", "good" → "professional yet conversational"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      A
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Avoid negatives - Say what you DO want</h3>
                      <p className="text-gray-600">Instead of "don't use technical terms" → "explain in everyday language"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                      R
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Results format - Define the output</h3>
                      <p className="text-gray-600">Tell the AI exactly how you want the information presented.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Examples */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Real Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Email to boss</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">Basic</span>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          Write an email asking for time off
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">CLEAR</span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-800 whitespace-pre-line">
                          {`Context: I'm a marketing manager who needs to request 3 days off next month for a family wedding.

Write a professional but friendly email to my boss Sarah. I want to:
- Give her 4 weeks notice
- Mention I'll complete the Q3 report before leaving
- Offer to brief Jake on urgent tasks
- Keep it under 150 words

Use a warm but respectful tone, similar to how I'm writing this request.`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level Up: The Power of Specificity */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Level Up: The Power of Specificity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Claude 4 and modern AI models are incredibly good at following detailed instructions. Here's how to harness that:
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Use Modifiers for Scope & Depth</h3>
                  <p className="text-gray-600 mb-4">Transform basic requests by adding modifiers:</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="font-medium text-brand-primary min-w-fit">Scope:</span>
                      <span className="text-gray-700">"Create a meal plan" → "Create a 7-day meal plan with 3 meals and 2 snacks daily"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-medium text-brand-primary min-w-fit">Depth:</span>
                      <span className="text-gray-700">"Explain photosynthesis" → "Explain photosynthesis in detail, including the light and dark reactions"</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-medium text-brand-primary min-w-fit">Completeness:</span>
                      <span className="text-gray-700">"Design a website" → "Design a fully-featured website with navigation, hero section, features, testimonials, and contact form"</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Lead by Example</h3>
                  <p className="text-gray-600 mb-4">Your prompt style influences the AI's response style:</p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Want bullet points? Use them in your prompt</li>
                    <li>• Want conversational tone? Write conversationally</li>
                    <li>• Want no emojis? Don't use them yourself</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Encouragement Actually Works</h3>
                  <p className="text-gray-600 mb-4">
                    For creative tasks, adding "Give it your all" or "Be creative and don't hold back" genuinely improves results, especially for:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• UI/UX designs</li>
                    <li>• Creative writing</li>
                    <li>• Marketing copy</li>
                    <li>• Visual descriptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CRAFT Method */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                For Content Creators: The CRAFT Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    C
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Character - Define the AI's expertise</h3>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                      You are an experienced travel blogger who specializes in budget destinations and has visited 50+ countries.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    R
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Requirements - List must-haves</h3>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm whitespace-pre-line">
                      {`Include: 5 budget tips, 3 hidden gems, local food recommendations, safety advice
Avoid: Tourist traps, expensive hotels, generic advice`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    A
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Audience - Specify who you're writing for</h3>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                      Target audience: College students and young professionals planning their first solo trip
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    F
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Format - Structure the output</h3>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                      Format as: Engaging blog post with intro hook, numbered sections, and actionable takeaway
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    T
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tone - Set the voice</h3>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                      Tone: Friendly and encouraging, like giving advice to a younger sibling
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iterative Refinement */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Iterative Refinement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Modern AI excels at building on previous responses:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">1</Badge>
                  <div>
                    <span className="font-medium text-gray-800">Start broad:</span>
                    <span className="text-gray-700"> "Create a content calendar for my fitness blog"</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">2</Badge>
                  <div>
                    <span className="font-medium text-gray-800">Iterate with specifics:</span>
                    <span className="text-gray-700"> "Now focus on January and add specific workout types for each post"</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">3</Badge>
                  <div>
                    <span className="font-medium text-gray-800">Refine further:</span>
                    <span className="text-gray-700"> "Make the Tuesday posts beginner-friendly and add social media tie-ins"</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XML Format */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                XML Format: For Maximum Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                When you need precision, XML formatting gives you superpowers:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Basic XML Structure:</h4>
                <div className="bg-white p-4 rounded border font-mono text-sm whitespace-pre-line">
                  {`<request>
  <role>Social media strategist for small businesses</role>
  <task>Create Instagram content strategy</task>
  <requirements>
    <post_types>Reels, Stories, Carousels</post_types>
    <frequency>Daily posting schedule</frequency>
    <goals>Increase engagement and followers</goals>
  </requirements>
  <deliverables>
    <content_calendar>30 days</content_calendar>
    <captions>First week examples</captions>
    <hashtag_strategy>Niche-specific</hashtag_strategy>
  </deliverables>
</request>`}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3">When to Use XML:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complex multi-part requests</li>
                  <li>• Consistent format needed across multiple uses</li>
                  <li>• Integration with other tools</li>
                  <li>• Professional documentation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Common Pitfalls */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Common Pitfalls & Fixes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">Too Vague</span>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          "Help me with my presentation"
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">Just Right</span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-800">
                          "I'm presenting our Q4 sales results to executives next week. Create an outline for a 15-minute presentation that highlights our 20% growth, addresses the missed targets in the Midwest region, and ends with our 2025 expansion strategy. Use a confident but not arrogant tone."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700">Information Overload</span>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          [500 words of background before getting to the actual request]
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700">Focused Context</span>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <code className="text-sm text-gray-800">
                          "Context: I run a pet grooming business in Denver, established 2020, focusing on anxious dogs. Task: Write 3 social media posts showcasing our calming techniques."
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Templates */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Quick Start Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">For Everyday Tasks:</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Email Draft:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {`Context: [Your situation]
Write a [tone] email to [recipient] about [topic].
Key points to include: [list 3-5 points]
Keep it [length] and [style].`}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Learning Something New:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {`Explain [topic] like I'm someone who knows [current knowledge level].
Use [everyday examples/analogies].
Break it into [number] main concepts.
Include practical applications I can try today.`}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">For Creators:</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Blog Post:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {`Role: [Expert type] with [specific experience]
Create a [word count] blog post about [topic]
Target audience: [specific demographic]
Include: [list requirements]
Tone: [description]
Format with: [structural elements]
End with: [call-to-action type]`}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Video Script:</h4>
                      <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                        {`Create a [length] video script for [platform]
Topic: [specific angle on topic]
Hook: [type of opening]
Main points: [list 3-5]
Style: [reference similar creator]
Include: [specific elements like b-roll notes]`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Next Steps */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Your Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">1</Badge>
                  <span className="text-gray-700"><strong>Start Simple:</strong> Use the CLEAR framework for your next AI request</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">2</Badge>
                  <span className="text-gray-700"><strong>Experiment:</strong> Try adding ONE modifier to improve specificity</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">3</Badge>
                  <span className="text-gray-700"><strong>Iterate:</strong> Build on responses instead of starting over</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">4</Badge>
                  <span className="text-gray-700"><strong>Template It:</strong> Save your best prompts for reuse</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-brand-primary text-white">5</Badge>
                  <span className="text-gray-700"><strong>Level Up:</strong> Try XML format for complex projects</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remember: AI Partnership */}
          <Card className="bg-brand-primary/5 rounded-2xl shadow-sm border border-brand-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Remember: AI Partnership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Modern AI models like Claude 4 are partners, not servants. They respond best when you:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Provide clear context and goals</li>
                <li>• Show respect in your communication style</li>
                <li>• Build on their responses iteratively</li>
                <li>• Give them creative freedom within boundaries</li>
              </ul>
              <p className="text-gray-700 mt-4 font-medium">
                The better you communicate, the better results you'll get. Start with one technique today, and watch your AI interactions transform.
              </p>
              
              <div className="mt-6 text-center">
                <Link href="/">
                  <Button className="bg-brand-primary text-white hover:bg-brand-secondary inline-flex items-center gap-2">
                    Ready to enhance your prompts automatically? Try Make Prompts Better
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}