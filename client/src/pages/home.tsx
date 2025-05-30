import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Logo } from "@/components/logo";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowUp, Loader2, ChevronDown, ChevronRight, Upload, X } from "lucide-react";
import { optimizePrompt, getCreditsStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const [, setLocation] = useLocation();
  const [promptText, setPromptText] = useState("");
  const [contextText, setContextText] = useState("");
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get credits status
  const { data: creditsData } = useQuery({
    queryKey: ["/api/credits"],
    refetchInterval: 60000, // Refresh every minute
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
      if (error.message?.includes("out_of_credits") || error.status === 429) {
        setShowUpgradeModal(true);
      } else if (error.message?.includes("rate_limit_exceeded")) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Please wait a moment before trying again.",
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

  const handleOptimize = () => {
    if (!promptText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to improve!",
        variant: "destructive",
      });
      return;
    }

    if (creditsData?.creditsRemaining === 0) {
      setShowUpgradeModal(true);
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
      {/* Header with Logo */}
      <header className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <Logo />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4 font-title">
            make prompts better
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform vague ideas into AI-ready prompts that get amazing results
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-6 w-full">
          
          {/* Prompt Input */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-300 mb-8">
            <CardContent className="p-8">
              <Textarea
                placeholder="Enter what you want here..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-32 resize-none border-none focus:outline-none text-xl text-gray-700 placeholder-gray-400 focus-visible:ring-0"
              />
              
              {/* Context Section */}
              <div className="border-t border-gray-100 mt-6 pt-6">
                <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-0 h-auto text-gray-600 hover:text-gray-900"
                    >
                      {isContextOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      Add context (optional)
                      {contextText && (
                        <Badge variant="secondary" className="ml-2">
                          {getWordCount(contextText)} words
                        </Badge>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        Add additional context like resume details, job descriptions, or background information (max 500 words)
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
                        className="min-h-[100px] text-lg"
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
                <Link href="/prompt-school">
                  <Button variant="outline" className="px-6 py-3">
                    Learn
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Bar */}
          <Card className="bg-white rounded-xl border border-gray-200 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-brand-primary">432</div>
                  <div className="text-sm text-gray-600">Total prompts improved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-primary">71%</div>
                  <div className="text-sm text-gray-600">Average improvement</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-primary">20 Hours</div>
                  <div className="text-sm text-gray-600">Saved because of Better Prompting</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Badge */}
          <div className="text-center">
            <Badge className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 border border-green-200 hover:bg-green-50">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {creditsData?.creditsRemaining ?? 3} free optimizations today
            </Badge>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        creditsResetTime={creditsData?.resetsAt}
      />
    </div>
  );
}
