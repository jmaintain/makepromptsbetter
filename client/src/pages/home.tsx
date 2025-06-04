import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Logo } from "@/components/logo";
import { TokenPurchaseModal } from "@/components/token-purchase-modal";
import { TokenBalanceDisplay } from "@/components/token-balance-display";
import { LoginModal } from "@/components/login-modal";
import { WordCounter } from "@/components/word-counter";
import { RatingLight } from "@/components/rating-light";
import { PrivacyNotice } from "@/components/privacy-notice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowUp, Loader2, ChevronDown, ChevronRight, Upload, X, AlertTriangle } from "lucide-react";
import { optimizePrompt, getCreditsStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import type { UserStats, CreditsStatus } from "@/../../shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [promptText, setPromptText] = useState("");
  const [contextText, setContextText] = useState("");
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [showTokenPurchaseModal, setShowTokenPurchaseModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cache and restore prompt data on load
  useEffect(() => {
    const cachedPrompt = localStorage.getItem('pendingPrompt');
    const cachedContext = localStorage.getItem('pendingContext');
    
    if (cachedPrompt) {
      setPromptText(cachedPrompt);
      localStorage.removeItem('pendingPrompt');
    }
    
    if (cachedContext) {
      setContextText(cachedContext);
      setIsContextOpen(true);
      localStorage.removeItem('pendingContext');
    }
  }, []);

  // Auto-optimize when user logs in with cached prompt
  useEffect(() => {
    if (user && promptText.trim() && !optimizeMutation.isPending) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleOptimize();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]); // Only trigger when user state changes

  // Get user stats for word limits
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-focus the main text input when page loads
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, []);

  // Get credits status (only for authenticated users)
  const { data: creditsData } = useQuery<CreditsStatus>({
    queryKey: ["/api/credits"],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Word count function
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file (.txt)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const wordCount = getWordCount(content);
      
      if (wordCount > 500) {
        toast({
          title: "File too large",
          description: `The file contains ${wordCount} words. Please limit to 500 words maximum.`,
          variant: "destructive",
        });
        return;
      }
      
      setContextText(content);
      setIsContextOpen(true);
      toast({
        title: "File uploaded successfully",
        description: `Added ${wordCount} words of context`,
      });
    };
    reader.readAsText(file);
  };

  // Clear context
  const clearContext = () => {
    setContextText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Optimize prompt mutation
  const optimizeMutation = useMutation({
    mutationFn: (data: { originalPrompt: string; contextText?: string }) => optimizePrompt(data),
    onSuccess: (data) => {
      // Store the result in sessionStorage to pass to results page
      sessionStorage.setItem("promptResult", JSON.stringify({
        original: promptText,
        optimized: data.optimizedPrompt,
        improvement: data.improvement,
        contextText: contextText.trim() || null,
      }));
      
      // Invalidate credits query to refresh count
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      
      // Navigate to results
      setLocation("/results");
    },
    onError: (error: any) => {
      if (error.message?.includes("insufficient_tokens") || error.status === 402) {
        setShowTokenPurchaseModal(true);
        toast({
          title: "Insufficient Tokens",
          description: "You need more tokens to perform this optimization. Purchase tokens to continue.",
          variant: "destructive",
        });
      } else if (error.message?.includes("rate_limit_exceeded")) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else if (error.message?.includes("word_limit_exceeded")) {
        toast({
          title: "Word Limit Exceeded",
          description: error.message || "Your prompt exceeds the maximum word limit.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to optimize prompt. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Get word limit based on tier
  const getWordLimit = () => {
    if (!userStats) return 200; // Default for non-authenticated users
    switch (userStats.tier) {
      case 'pro': return 500;
      case 'starter': return 300;
      default: return 200;
    }
  };

  const wordLimit = getWordLimit();
  const wordCount = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;

  const handleOptimize = () => {
    if (!promptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to improve!",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user) {
      // Cache the prompt and context before showing login modal
      localStorage.setItem('pendingPrompt', promptText.trim());
      if (contextText.trim()) {
        localStorage.setItem('pendingContext', contextText.trim());
      }
      setShowLoginModal(true);
      return;
    }

    // Check word limit
    if (wordCount > wordLimit) {
      toast({
        title: "Word Limit Exceeded",
        description: `Your prompt has ${wordCount} words, but your ${userStats?.tier || 'free'} tier allows only ${wordLimit} words. Please shorten your prompt or upgrade your plan.`,
        variant: "destructive",
      });
      return;
    }

    if (creditsData?.creditsRemaining === 0) {
      setShowTokenPurchaseModal(true);
      return;
    }
    
    const contextWordCount = getWordCount(contextText);
    if (contextText && contextWordCount > 500) {
      toast({
        title: "Context too long",
        description: `Please limit context to 500 words maximum. Current: ${contextWordCount} words.`,
        variant: "destructive",
      });
      return;
    }

    optimizeMutation.mutate({ 
      originalPrompt: promptText.trim(),
      contextText: contextText.trim() || undefined
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleOptimize();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="pt-6 sm:pt-12 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-main-title font-heading text-brand-primary mb-3 sm:mb-4">
            makepromptsbetter
          </h1>
          <p className="text-tagline font-body text-gray-700 max-w-2xl mx-auto px-2">
            Say what you want. Get exactly what you mean.
          </p>
          <p className="text-sm font-body text-gray-600 max-w-2xl mx-auto px-2 mt-2">
            (No prompt engineering required)
          </p>
          {/* Quick guidance */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Quick Start:</strong> Enter your Prompt ➡ Improve ➡ Copy ➡ Use it!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
          
          {/* Prompt Input */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-300 mb-6 sm:mb-8">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <Textarea
                ref={promptInputRef}
                placeholder="Type what you want AI to do... e.g., 'Write a professional email declining a meeting' or 'Create a marketing strategy for my startup'"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-32 resize-none border-none focus:outline-none text-code font-code text-gray-700 placeholder-gray-400 focus-visible:ring-0"
              />
              
              {/* Word Counter and Rating */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <WordCounter text={promptText} limit={wordLimit} />
                {promptText.trim() && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Quality:</span>
                    <RatingLight prompt={promptText.trim()} />
                    <span className="text-xs text-gray-400 italic hidden sm:inline">hover for details</span>
                  </div>
                )}
              </div>
              
              {/* Context Section */}
              <div className="border-t border-gray-100 mt-6 pt-6">
                <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
                  <CollapsibleTrigger asChild>
                    <div className="w-full">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-2 sm:p-0 h-auto text-gray-600 hover:text-gray-900 w-full justify-start"
                      >
                        <div className="flex-shrink-0">
                          {isContextOpen ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                        <span className="text-sm font-medium">Add context (optional)</span>
                        {contextText && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {getWordCount(contextText)} words
                          </Badge>
                        )}
                      </Button>
                      <div className="text-xs text-gray-500 mt-1 px-6 sm:px-0">
                        Supporting information like your resume, meeting notes, etc.
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        (max 500 words)
                      </div>
                      
                      {/* File Upload */}
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,text/plain"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload .txt file
                        </Button>
                        {contextText && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearContext}
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </Button>
                        )}
                      </div>
                      
                      {/* Text Input */}
                      <Textarea
                        placeholder="Or paste your context text here..."
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                        className="min-h-[100px] text-code font-code"
                      />
                      
                      {/* Word Count */}
                      <div className="text-xs text-gray-500 text-right">
                        {getWordCount(contextText)}/500 words
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  onClick={handleOptimize}
                  disabled={optimizeMutation.isPending}
                  className="flex-1 sm:flex-none bg-brand-primary text-white px-8 py-3 hover:bg-brand-secondary focus:ring-brand-primary"
                >
                  {optimizeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 mr-2" />
                  )}
                  Improve
                </Button>

              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Card className="bg-white rounded-xl border border-gray-200 mb-8">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-section-header font-subheading text-brand-primary mb-3">Save Hours</div>
                  <div className="text-gray-600 font-body">No need to master prompt engineering — though you'll pick up a few tips along the way </div>
                </div>
                <div className="text-center">
                  <div className="text-section-header font-subheading text-brand-primary mb-3">Get Better Results</div>
                  <div className="text-gray-600 font-body">Transform vague ideas into precise prompts</div>
                </div>
                <div className="text-center">
                  <div className="text-section-header font-subheading text-brand-primary mb-3">Learn Naturally</div>
                  <div className="text-gray-600 font-body">Learn what makes a great prompt through our transparent quality scores</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Before/After Example */}
          <Card className="bg-white rounded-xl border border-gray-200 mb-6">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6 sm:mb-8">See the Difference</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Before */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="font-semibold text-gray-700">Before</span>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-gray-800 mb-3">
                      "Write an Instagram post about our new coffee blend"
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Context (100 words):</div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      Coffee Shop: Bean & Grind Local Roasters<br/>
                      New Blend: "Morning Ritual" - medium roast, chocolate notes<br/>
                      Audience: Local coffee lovers, morning commuters<br/>
                      Instagram Style: Casual, community-focused, behind-the-scenes<br/>
                      Hashtags: Mix of local and coffee tags
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="font-semibold text-gray-700">After</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-gray-800 leading-relaxed">
                      "Create a casual, community-focused Instagram post that introduces 'Morning Ritual,' our new medium roast with chocolate notes, highlighting its aroma and flavor to evoke warmth and familiarity, while encouraging local coffee lovers to visit Bean & Grind to experience it firsthand."
                    </div>
                    <div className="mt-3 text-sm font-medium text-gray-700">
                      Call-to-Action: Visit shop, try new blend
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Badge - Only for authenticated users */}
          {user && (
            <div className="text-center">
              <Badge className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 border border-green-200 hover:bg-green-50">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {creditsData?.creditsRemaining ?? 0} optimizations remaining{creditsData?.resetsAt ? ' this month' : ''}
              </Badge>
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className="max-w-2xl mx-auto mt-12">
            <PrivacyNotice variant="compact" className="text-center" />
          </div>
        </div>
      </main>

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        open={showTokenPurchaseModal}
        onOpenChange={setShowTokenPurchaseModal}
      />

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
      />
    </div>
  );
}
