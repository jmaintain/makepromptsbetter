import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Target, Save, TestTube, RotateCcw, Sparkles, ArrowLeft, HelpCircle } from "lucide-react";
import { createPersona, enhancePersona, savePersona, testPersona, getCreditsStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UpgradeModal } from "@/components/upgrade-modal";
import { formatTimeUntilReset } from "@/lib/credits";
import { cleanMarkdown } from "@/lib/text-utils";
import { Link } from "wouter";
import { PersonaUsageGuide } from "@/components/persona-usage-guide";
import type { CreatePersonaResponse, EnhancePersonaRequest } from "@shared/schema";

export default function PersonaBuilder() {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [persona, setPersona] = useState<CreatePersonaResponse | null>(null);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showUsageGuide, setShowUsageGuide] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [enhancements, setEnhancements] = useState<EnhancePersonaRequest["enhancements"]>({});
  const { toast } = useToast();

  const { data: creditsStatus } = useQuery({
    queryKey: ["/api/credits"],
    refetchInterval: 60000,
  });

  const createPersonaMutation = useMutation({
    mutationFn: createPersona,
    onSuccess: (data) => {
      setPersona(data);
      toast({
        title: "AI Assistant created successfully!",
        description: `Your ${data.name} is ready to use.`,
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("429") || error.message?.includes("limit")) {
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Failed to create AI assistant",
          description: "Please try again with a different description.",
          variant: "destructive",
        });
      }
    },
  });

  const enhancePersonaMutation = useMutation({
    mutationFn: ({ personaId, enhancements }: { personaId: number; enhancements: EnhancePersonaRequest["enhancements"] }) => 
      enhancePersona(personaId, { enhancements }),
    onSuccess: (data) => {
      if (persona) {
        setPersona({ ...persona, persona: data.persona });
        setShowEnhancement(false);
        toast({
          title: "AI Assistant enhanced!",
          description: `Updated: ${data.changes.join(", ")}`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to enhance AI assistant",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const savePersonaMutation = useMutation({
    mutationFn: (personaId: number) => savePersona(personaId),
    onSuccess: (data) => {
      toast({
        title: "AI Assistant saved!",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Failed to save AI assistant",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const testPersonaMutation = useMutation({
    mutationFn: ({ personaId, testPrompt }: { personaId: number; testPrompt: string }) => 
      testPersona({ personaId, testPrompt }),
    onSuccess: (data) => {
      setTestResponse(data.response);
    },
    onError: () => {
      toast({
        title: "Failed to test persona",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (input.trim().length < 10) {
      toast({
        title: "Description too short",
        description: "Please provide at least 10 characters describing what you want your AI assistant to do.",
        variant: "destructive",
      });
      return;
    }

    createPersonaMutation.mutate({
      input: input.trim(),
      name: name.trim() || undefined,
    });
  };

  const handleEnhance = () => {
    if (!persona) return;

    enhancePersonaMutation.mutate({
      personaId: persona.id,
      enhancements,
    });
  };

  const handleCopyPersona = () => {
    if (persona) {
      navigator.clipboard.writeText(persona.persona);
      toast({
        title: "Copied to clipboard",
        description: "Your persona has been copied and is ready to use.",
      });
    }
  };

  const handleSavePersona = () => {
    if (!persona) return;
    savePersonaMutation.mutate(persona.id);
  };

  const handleTestPersona = () => {
    if (!persona) return;
    setShowTestModal(true);
    setTestResponse("");
  };

  const handleRunTest = () => {
    if (!persona || !testPrompt.trim()) return;
    testPersonaMutation.mutate({
      personaId: persona.id,
      testPrompt: testPrompt.trim(),
    });
  };

  const handleStartOver = () => {
    setInput("");
    setName("");
    setPersona(null);
    setShowEnhancement(false);
    setShowTestModal(false);
    setTestPrompt("");
    setTestResponse("");
    setEnhancements({});
  };

  const updateEnhancement = (category: string, field: string, value: string) => {
    setEnhancements(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowUsageGuide(true)}
                className="inline-flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Usage Guide & FAQ
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI Assistant Builder
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                Create sophisticated AI assistants in two phases: get immediate results, then enhance with targeted improvements.
              </p>
              
              {/* Why Use Personas Description - Simplified */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
                <h2 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 text-center">
                  Why Create an AI Persona?
                </h2>
                <div className="flex justify-center items-center gap-6 text-xs text-blue-800 dark:text-blue-200">
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>Consistent results</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>Expert knowledge</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Save className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>Save time</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span>Quality standards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!persona ? (
            /* Phase 1: Initial Form */
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Describe Your AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="input" className="text-base font-medium">
                    What should your AI assistant do?
                  </Label>
                  <Textarea
                    id="input"
                    placeholder="Describe what you want your AI assistant to do... (e.g., 'Help me write marketing copy for my coffee shop' or 'I need an AI to help me code better Python applications')"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-2 min-h-[120px] text-base"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {input.length}/1000 characters
                    </span>
                    <span className="text-sm text-gray-500">
                      Recommended: 50-500 characters
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    What should we call it? (Optional)
                  </Label>
                  <Input
                    id="name"
                    placeholder="Assistant name (auto-generated if empty)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Example suggestions:</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p>• "Help me write engaging social media content for my local bakery"</p>
                    <p>• "Assist with debugging and optimizing Python code for data science"</p>
                    <p>• "Create lesson plans and activities for 5th grade math students"</p>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createPersonaMutation.isPending || input.trim().length < 10}
                  className="w-full h-12 text-lg font-medium"
                >
                  {createPersonaMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      Generating Persona...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-5 w-5" />
                      Generate Persona
                    </>
                  )}
                </Button>

                {creditsStatus && (
                  <div className="text-center text-sm text-gray-500">
                    {(creditsStatus as any).creditsRemaining} generations remaining today
                    {(creditsStatus as any).resetsAt && (
                      <span> • Resets {formatTimeUntilReset((creditsStatus as any).resetsAt)}</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Phase 1 Results & Phase 2 Enhancement */
            <div className="space-y-6">
              {/* Generated Persona Display */}
              <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {persona.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Phase {showEnhancement ? "2" : "1"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div 
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: cleanMarkdown(persona.persona).replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {persona.canEnhance && !showEnhancement && (
                  <Button
                    onClick={() => setShowEnhancement(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Make it Better
                  </Button>
                )}
                
                <Button variant="outline" onClick={handleCopyPersona}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy AI Assistant
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleSavePersona}
                  disabled={savePersonaMutation.isPending}
                >
                  {savePersonaMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save AI Assistant
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={handleTestPersona}>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test AI Assistant
                </Button>
                
                <Button variant="outline" onClick={handleStartOver}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>

              {/* Phase 2: Enhancement Panel */}
              {showEnhancement && (
                <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                      Fine-tune Your Persona
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">
                      Answer any questions below to customize your persona. Skip sections you don't need.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="space-y-4">
                      {/* Communication Refinement */}
                      <AccordionItem value="communication" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-medium">
                          Communication Style
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label className="text-base">How formal should the communication be?</Label>
                            <Select onValueChange={(value) => updateEnhancement("communication", "formality", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select formality level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="very-formal">Very formal and professional</SelectItem>
                                <SelectItem value="formal">Formal but approachable</SelectItem>
                                <SelectItem value="casual">Casual and friendly</SelectItem>
                                <SelectItem value="very-casual">Very casual and conversational</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base">Response length preference?</Label>
                            <Select onValueChange={(value) => updateEnhancement("communication", "responseLength", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select response style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="brief">Brief and actionable</SelectItem>
                                <SelectItem value="balanced">Balanced detail</SelectItem>
                                <SelectItem value="detailed">Detailed explanations</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base">Should it offer suggestions proactively?</Label>
                            <Select onValueChange={(value) => updateEnhancement("communication", "proactiveness", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select proactiveness level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reactive">Wait for requests</SelectItem>
                                <SelectItem value="balanced">Balanced approach</SelectItem>
                                <SelectItem value="proactive">Offer suggestions regularly</SelectItem>
                                <SelectItem value="very-proactive">Very proactive with ideas</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Expertise Deepening */}
                      <AccordionItem value="expertise" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-medium">
                          Expertise & Knowledge
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label className="text-base">Specific industry knowledge needed?</Label>
                            <Textarea
                              placeholder="e.g., Healthcare regulations, SaaS marketing, educational standards..."
                              onChange={(e) => updateEnhancement("expertise", "industryKnowledge", e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label className="text-base">Common mistakes to help avoid?</Label>
                            <Textarea
                              placeholder="e.g., Security vulnerabilities, marketing compliance issues, teaching pitfalls..."
                              onChange={(e) => updateEnhancement("expertise", "commonMistakes", e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label className="text-base">Technical depth required?</Label>
                            <Select onValueChange={(value) => updateEnhancement("expertise", "technicalDepth", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select technical level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner-friendly</SelectItem>
                                <SelectItem value="intermediate">Intermediate level</SelectItem>
                                <SelectItem value="advanced">Advanced technical</SelectItem>
                                <SelectItem value="expert">Expert level</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Problem-Solving Customization */}
                      <AccordionItem value="problemSolving" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-medium">
                          Problem-Solving Approach
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label className="text-base">For creative tasks, should it explore multiple options?</Label>
                            <Select onValueChange={(value) => updateEnhancement("problemSolving", "creativeApproach", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select creative approach" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Focus on one strong solution</SelectItem>
                                <SelectItem value="few">Provide 2-3 options</SelectItem>
                                <SelectItem value="multiple">Explore multiple approaches</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive exploration</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-base">For urgent situations, prioritize speed or thoroughness?</Label>
                            <Select onValueChange={(value) => updateEnhancement("problemSolving", "urgencyHandling", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select urgency handling" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="speed">Prioritize speed</SelectItem>
                                <SelectItem value="balanced">Balanced approach</SelectItem>
                                <SelectItem value="thorough">Prioritize thoroughness</SelectItem>
                                <SelectItem value="contextual">Adapt to situation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Context & Memory */}
                      <AccordionItem value="context" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-medium">
                          Context & Memory
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div>
                            <Label className="text-base">What should it remember across conversations?</Label>
                            <Textarea
                              placeholder="e.g., Project preferences, style guidelines, past decisions..."
                              onChange={(e) => updateEnhancement("context", "memoryPreferences", e.target.value)}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label className="text-base">Should it track project progress?</Label>
                            <Select onValueChange={(value) => updateEnhancement("context", "progressTracking", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select tracking level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No tracking</SelectItem>
                                <SelectItem value="basic">Basic milestones</SelectItem>
                                <SelectItem value="detailed">Detailed progress</SelectItem>
                                <SelectItem value="comprehensive">Comprehensive tracking</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <Separator className="my-6" />

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleEnhance}
                        disabled={enhancePersonaMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {enhancePersonaMutation.isPending ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Target className="mr-2 h-4 w-4" />
                            Apply Changes
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowEnhancement(false)}
                      >
                        Use Basic Version
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        creditsResetTime={(creditsStatus as any)?.resetsAt}
      />

      {/* Test Persona Dialog */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Your AI Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPrompt">Enter a prompt to test your AI assistant:</Label>
              <Textarea
                id="testPrompt"
                placeholder="e.g., 'Help me write a social media post about our new coffee blend' or 'Debug this Python function that's running slowly'"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="mt-2 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleRunTest}
              disabled={testPersonaMutation.isPending || !testPrompt.trim()}
              className="w-full"
            >
              {testPersonaMutation.isPending ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Testing AI Assistant...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>

            {testResponse && (
              <div className="mt-4">
                <Label>Persona Response:</Label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <div 
                    className="whitespace-pre-wrap text-sm prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanMarkdown(testResponse).replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(testResponse)}
                  className="mt-2"
                  size="sm"
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Copy Response
                </Button>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setTestPrompt("");
                  setTestResponse("");
                }}
                disabled={testPersonaMutation.isPending}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTestModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PersonaUsageGuide 
        open={showUsageGuide} 
        onOpenChange={setShowUsageGuide}
      />
    </div>
  );
}