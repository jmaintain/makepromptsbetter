import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ExternalLink, Lightbulb, Sparkles, ChevronDown, ChevronRight, FileText, AlertTriangle, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RatingLight } from "@/components/rating-light";
import { cleanMarkdown } from "@/lib/text-utils";
import confetti from "canvas-confetti";

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
  const [hasUserSaved, setHasUserSaved] = useState(false);
  const { toast } = useToast();

  // Enhanced protection system
  const isResultProtected = !hasUserCopied && !hasUserSaved;

  // Browser navigation protection
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isResultProtected && result) {
      e.preventDefault();
      e.returnValue = "You have an unsaved optimization result. If you leave now, you'll lose it forever.";
      return e.returnValue;
    }
  }, [isResultProtected, result]);

  // Backup to localStorage for additional protection
  const createBackup = useCallback((promptResult: PromptResult) => {
    const backup = {
      ...promptResult,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem("promptResult_backup", JSON.stringify(backup));
  }, []);

  useEffect(() => {
    // Clear security flag for new results
    localStorage.removeItem("resultSecured");
    
    // Get result from sessionStorage
    const stored = sessionStorage.getItem("promptResult");
    if (stored) {
      const parsedResult = JSON.parse(stored);
      setResult(parsedResult);
      // Create backup immediately
      createBackup(parsedResult);
      // Trigger confetti celebration when results load
      triggerCelebrationConfetti();
    } else {
      // Check for backup if session storage is empty
      const backup = localStorage.getItem("promptResult_backup");
      if (backup) {
        const backupData = JSON.parse(backup);
        // Only restore backup if it's less than 1 hour old
        if (Date.now() - backupData.timestamp < 3600000) {
          setResult(backupData);
          // Restore to session storage
          sessionStorage.setItem("promptResult", JSON.stringify(backupData));
          toast({
            title: "Result Restored",
            description: "We recovered your optimization result from backup.",
          });
        } else {
          // Clean up old backup
          localStorage.removeItem("promptResult_backup");
          setLocation("/");
        }
      } else {
        setLocation("/");
      }
    }
  }, [setLocation, createBackup, toast]);

  // Add browser navigation protection
  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  const triggerCelebrationConfetti = () => {
    // Main celebration burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Side bursts for extra celebration
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.1 }
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.9 }
      });
    }, 400);
  };

  const triggerCopyConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 },
      colors: ['#10b981', '#059669', '#047857']
    });
  };

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
      localStorage.setItem("resultSecured", "true");
      triggerCopyConfetti();
      toast({
        title: "Copied & Secured!",
        description: "Your optimized prompt is now safely copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSaveToFile = () => {
    if (!result) return;
    
    try {
      const content = `ORIGINAL PROMPT:\n${result.original}\n\nOPTIMIZED PROMPT:\n${result.optimized}\n\nIMPROVEMENT: ${result.improvement}%\n\nGenerated on: ${new Date().toLocaleString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `optimized-prompt-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setHasUserSaved(true);
      localStorage.setItem("resultSecured", "true");
      toast({
        title: "Saved to File!",
        description: "Your prompt optimization has been saved to your device",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      });
    }
  };

  const handleOpenChatGPT = async () => {
    if (!result) return;
    
    // Copy to clipboard first for consistency and reliability
    try {
      await navigator.clipboard.writeText(result.optimized);
      setHasUserCopied(true);
      localStorage.setItem("resultSecured", "true");
      toast({
        title: "Copied & Opening ChatGPT",
        description: "Prompt copied to clipboard and opening ChatGPT.",
      });
    } catch (error) {
      toast({
        title: "Opening ChatGPT",
        description: "Please copy your prompt manually and paste it in ChatGPT.",
        variant: "destructive",
      });
    }
    
    // Open ChatGPT with URL parameter as fallback
    const encodedPrompt = encodeURIComponent(result.optimized);
    window.open(`https://chat.openai.com/?q=${encodedPrompt}`, "_blank");
  };

  const handleOpenClaude = async () => {
    if (!result) return;
    
    // Copy to clipboard first since Claude doesn't support URL parameters
    try {
      await navigator.clipboard.writeText(result.optimized);
      setHasUserCopied(true);
      localStorage.setItem("resultSecured", "true");
      toast({
        title: "Copied & Opening Claude",
        description: "Prompt copied to clipboard. Paste it in Claude when it opens.",
      });
      // Open Claude in a new tab
      window.open(`https://claude.ai/chat`, "_blank");
    } catch (error) {
      // Fallback: just open Claude
      window.open(`https://claude.ai/chat`, "_blank");
      toast({
        title: "Opening Claude",
        description: "Please copy your prompt manually and paste it in Claude.",
        variant: "destructive",
      });
    }
  };

  const handleOpenGemini = async () => {
    if (!result) return;
    
    // Copy to clipboard first since Gemini doesn't support URL parameters
    try {
      await navigator.clipboard.writeText(result.optimized);
      setHasUserCopied(true);
      localStorage.setItem("resultSecured", "true");
      toast({
        title: "Copied & Opening Gemini",
        description: "Prompt copied to clipboard. Paste it in Gemini when it opens.",
      });
      // Open Gemini in a new tab
      window.open(`https://gemini.google.com/app`, "_blank");
    } catch (error) {
      // Fallback: just open Gemini
      window.open(`https://gemini.google.com/app`, "_blank");
      toast({
        title: "Opening Gemini",
        description: "Please copy your prompt manually and paste it in Gemini.",
        variant: "destructive",
      });
    }
  };

  const handleTryAnother = () => {
    if (isResultProtected) {
      const shouldProceed = window.confirm(
        "⚠️ WARNING: You haven't secured your optimized prompt yet!\n\nThis cost you credits and cannot be recovered. If you continue without copying or saving, you'll lose this result forever.\n\nAre you absolutely sure you want to proceed?"
      );
      if (!shouldProceed) {
        return;
      }
    }
    
    // Clean up all storage
    sessionStorage.removeItem("promptResult");
    localStorage.removeItem("promptResult_backup");
    localStorage.removeItem("resultSecured");
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
    <div className="min-h-screen py-6 sm:py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-section-header font-heading text-gray-900 mb-4">
            Your Optimized Prompt is Ready!
          </h1>
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 border border-green-200 rounded-full font-medium">
            <Sparkles className="w-4 h-4 mr-1 text-green-600" />
            {result.improvement}% more specific
          </div>
        </div>

        {/* Enhanced Protection Alerts */}
        {isResultProtected && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong className="text-red-900">⚠️ SECURE YOUR RESULT:</strong> This optimization cost you credits and cannot be recovered. 
              You must copy or save it before leaving - there's no way to get it back once lost.
            </AlertDescription>
          </Alert>
        )}

        {(hasUserCopied || hasUserSaved) && (
          <Alert className="mb-6 border-green-300 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong className="text-green-900">✓ SECURED:</strong> Your optimization result is now safely {hasUserCopied && hasUserSaved ? 'copied and saved' : hasUserCopied ? 'copied to clipboard' : 'saved to file'}.
            </AlertDescription>
          </Alert>
        )}

        {/* Prompt Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Original Prompt */}
          <Card className="bg-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-heading font-semibold text-gray-900">Original Prompt</h3>
                <RatingLight prompt={result.original} />
              </div>
              <div className="text-code font-code text-gray-700 whitespace-pre-wrap bg-white p-4 rounded-lg border">
                {result.original}
              </div>
            </CardContent>
          </Card>

          {/* Optimized Prompt */}
          <Card className="border-2 border-brand-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-heading font-semibold text-brand-primary">Optimized Prompt</h3>
                <RatingLight prompt={result.optimized} />
              </div>
              <div className="text-code font-code text-gray-900 whitespace-pre-wrap bg-white p-4 rounded-lg border border-brand-primary/20">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
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
          <Button
            onClick={handleSaveToFile}
            variant="outline"
            className={`${hasUserSaved 
              ? 'border-green-600 text-green-600 hover:bg-green-50' 
              : 'border-orange-600 text-orange-600 hover:bg-orange-50'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {hasUserSaved ? 'Saved!' : 'Save File'}
          </Button>
          <Button variant="outline" onClick={handleOpenChatGPT}>
            Copy & Open ChatGPT
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleOpenClaude}>
            Copy & Open Claude
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={handleOpenGemini}>
            Copy & Open Gemini
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
