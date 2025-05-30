import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ExternalLink, Lightbulb, Sparkles, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RatingLight } from "@/components/rating-light";
import { cleanMarkdown } from "@/lib/text-utils";

interface PromptResult {
  original: string;
  optimized: string;
  improvement: number;
  contextText?: string | null;
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<PromptResult | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [hasUserCopied, setHasUserCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get result from sessionStorage
    const stored = sessionStorage.getItem("promptResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      // If no result, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  // Add navigation warning when user hasn't copied the prompt
  useEffect(() => {
    if (!result || hasUserCopied) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You haven't copied your optimized prompt yet. Are you sure you want to leave?";
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!hasUserCopied) {
        const shouldLeave = window.confirm(
          "You haven't copied your optimized prompt yet. Are you sure you want to leave this page?"
        );
        if (!shouldLeave) {
          e.preventDefault();
          // Push the current state back to prevent navigation
          window.history.pushState(null, "", window.location.pathname);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push a state to handle back button
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [result, hasUserCopied]);

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.optimized);
      setHasUserCopied(true);
      toast({
        title: "Copied!",
        description: "Optimized prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleOpenChatGPT = () => {
    if (!result) return;
    const encodedPrompt = encodeURIComponent(result.optimized);
    window.open(`https://chat.openai.com/?q=${encodedPrompt}`, "_blank");
  };

  const handleOpenClaude = () => {
    if (!result) return;
    const encodedPrompt = encodeURIComponent(result.optimized);
    window.open(`https://claude.ai/chat?q=${encodedPrompt}`, "_blank");
  };

  const handleOpenGemini = () => {
    if (!result) return;
    const encodedPrompt = encodeURIComponent(result.optimized);
    window.open(`https://gemini.google.com/chat?q=${encodedPrompt}`, "_blank");
  };

  const handleTryAnother = () => {
    // Mark as copied to bypass warning since this is intentional navigation
    setHasUserCopied(true);
    sessionStorage.removeItem("promptResult");
    setLocation("/");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Loading results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Optimized Prompt is Ready!
          </h1>
          <div className="inline-flex items-center bg-brand-accent bg-opacity-10 text-red-700 px-4 py-2 border border-brand-accent border-opacity-20 rounded-full font-medium">
            <Sparkles className="w-4 h-4 mr-1 text-red-700" />
            {result.improvement}% more specific
          </div>
        </div>

        {/* Prompt Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Original Prompt */}
          <Card className="bg-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900">Original Prompt</h3>
                <RatingLight prompt={result.original} />
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.original}
              </div>
            </CardContent>
          </Card>

          {/* Optimized Prompt */}
          <Card className="border-2 border-brand-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-semibold text-brand-primary">Optimized Prompt</h3>
                <RatingLight prompt={result.optimized} />
              </div>
              <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {cleanMarkdown(result.optimized)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Section */}
        {result.contextText && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-0 h-auto text-gray-600 hover:text-gray-900 w-full justify-start"
                  >
                    {isContextOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <FileText className="w-4 h-4" />
                    Context Used
                    <Badge variant="secondary" className="ml-2">
                      {result.contextText.trim().split(/\s+/).filter(word => word.length > 0).length} words
                    </Badge>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-2">
                      This context was used to enhance your prompt:
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {result.contextText}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}

        {/* Safety Notice */}
        {!hasUserCopied && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-amber-800 text-sm">
                <strong>Don't lose your optimized prompt!</strong> Copy it before leaving this page.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            onClick={handleCopy}
            className={`${hasUserCopied 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-brand-primary hover:bg-brand-secondary'
            } text-white focus:ring-brand-primary`}
          >
            <Copy className="w-4 h-4 mr-2" />
            {hasUserCopied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" onClick={handleOpenChatGPT}>
            Open in ChatGPT
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleOpenClaude}>
            Open in Claude
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleOpenGemini}>
            Open in Gemini
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Tip */}
        <Card className="bg-blue-50 border border-blue-200 mb-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <strong>Tip:</strong> This prompt works best with ChatGPT-4 or Claude for more detailed and nuanced responses.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Try Another */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleTryAnother}
            className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Try Another Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}
