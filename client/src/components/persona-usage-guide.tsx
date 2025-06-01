import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Clock, Brain, Users, Copy, Settings } from "lucide-react";

interface PersonaUsageGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonaUsageGuide({ open, onOpenChange }: PersonaUsageGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">AI Persona Usage Guide & FAQ</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Start Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Quick Start: Using Your Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="min-w-fit">Step 1</Badge>
                  <div>
                    <strong>Copy Your Persona Instructions</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Copy the complete persona from your results page and paste it into any AI chat (Claude, ChatGPT, etc.) as your first message.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="min-w-fit">Step 2</Badge>
                  <div>
                    <strong>Start Working</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Begin with: "I need help with [your specific task]" - The AI will respond according to your custom persona's style and expertise.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="min-w-fit">Step 3</Badge>
                  <div>
                    <strong>Reference When Needed</strong>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      If the AI forgets its role, just say "Remember your persona instructions". For new conversations, paste the persona again.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Set and Forget Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Set and Forget: Using Custom Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                For even better convenience, add your persona to the built-in custom instruction features in popular AI platforms:
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="chatgpt">
                  <AccordionTrigger>ChatGPT Custom Instructions</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm">Access via your username (bottom-left) → "Custom Instructions." You'll see two text boxes with a 1,500-character limit each.</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li><strong>First box:</strong> Add your role, industry, and context from your persona</li>
                      <li><strong>Second box:</strong> Include your persona's communication style and approach</li>
                      <li>Custom instructions apply to all new conversations automatically</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="claude">
                  <AccordionTrigger>Claude Projects</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm">Access via the Projects section on the left sidebar. Create a new project and add custom instructions in the project settings.</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>Create a dedicated project for your specific role or workflow</li>
                      <li>Upload relevant documents to provide context (200k token limit)</li>
                      <li>Set custom instructions that apply to all chats within that project</li>
                      <li>Perfect for team collaboration and maintaining consistent AI assistance</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="perplexity">
                  <AccordionTrigger>Perplexity Spaces</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p className="text-sm">Create a Space via the Spaces section. Add custom instructions that give the AI a specific persona or directions on how to respond.</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>Ideal for research-focused work with your persona's expertise</li>
                      <li>Upload files and set custom web sources for specialized knowledge</li>
                      <li>Choose between web browsing mode or direct AI conversation</li>
                      <li>Great for organizing research by topic or project</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Why Use Personas */}
          <Card>
            <CardHeader>
              <CardTitle>Why Use AI Personas?</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 mt-1 text-blue-500" />
                <div>
                  <strong className="text-sm">Get Consistent Results</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Instead of explaining your needs every time, your persona "remembers" your preferences, industry, and working style.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 mt-1 text-green-500" />
                <div>
                  <strong className="text-sm">Save Time on Setup</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    No more typing long explanations. Your persona contains all the context the AI needs to help you effectively.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 mt-1 text-purple-500" />
                <div>
                  <strong className="text-sm">Unlock Specialized Knowledge</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Personas tap into specific expertise areas, giving you more relevant and accurate assistance.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 mt-1 text-orange-500" />
                <div>
                  <strong className="text-sm">Maintain Quality Standards</strong>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Your persona ensures the AI follows your preferred communication style and quality standards across all interactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="usage">
                  <AccordionTrigger>General Usage</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div>
                      <strong className="text-sm">Q: Do I need to use the exact persona text every time?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Yes, for best results. The persona contains specific instructions that ensure consistent, high-quality responses tailored to your needs.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: Can I modify my persona after it's created?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Absolutely! Your persona should evolve with your needs. Edit the instructions, add new requirements, or refine the communication style as you learn what works best.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: How long should I expect my persona to be?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Most personas are 200-500 words. This provides enough detail for effective guidance without being overwhelming for the AI to process.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technical">
                  <AccordionTrigger>Technical Questions</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div>
                      <strong className="text-sm">Q: Which AI platforms work with personas?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Any text-based AI assistant (Claude, ChatGPT, Gemini, etc.). You can either paste your persona as the first message in a new conversation, or add it to built-in custom instruction features for automatic application.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: Do I need to paste the whole persona every time?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Not if you use custom instructions! ChatGPT's Custom Instructions, Claude Projects, and Perplexity Spaces all let you set persona instructions once and apply them automatically to new conversations.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: Can I use one persona for multiple types of tasks?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Yes, but specialized personas typically work better. Consider creating different personas for distinct types of work (e.g., one for writing, one for analysis).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="optimization">
                  <AccordionTrigger>Results & Optimization</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div>
                      <strong className="text-sm">Q: What if the AI doesn't follow my persona instructions?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Try being more specific in your requests, or add clarifying details to your persona. Some AIs respond better to certain instruction formats.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: How do I know if my persona is working well?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: You should notice more relevant responses, less need to re-explain context, and outputs that match your preferred style and quality standards.
                      </p>
                    </div>
                    <div>
                      <strong className="text-sm">Q: Can I share my persona with my team?</strong>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        A: Yes! This is a great way to ensure consistent AI assistance across your organization. You can share the persona text directly, or use platform-specific sharing features.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}