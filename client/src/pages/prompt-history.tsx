import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Copy, 
  Trash2, 
  History, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  FileText,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHistory, clearHistory, deleteHistoryItem, formatTimestamp } from "@/lib/prompt-history";
import { RatingLight } from "@/components/rating-light";
import { cleanMarkdown } from "@/lib/text-utils";

export default function PromptHistory() {
  const [history, setHistory] = useState(getHistory());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleCopy = async (text: string, type: 'original' | 'optimized') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type === 'original' ? 'Original' : 'Optimized'} prompt copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
    toast({
      title: "Deleted",
      description: "Prompt removed from history",
    });
  };

  const handleClearAll = () => {
    const shouldClear = window.confirm(
      "Are you sure you want to clear all prompt history? This action cannot be undone."
    );
    if (shouldClear) {
      clearHistory();
      setHistory([]);
      toast({
        title: "History Cleared",
        description: "All prompt history has been removed",
      });
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen py-6 sm:py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Prompt History</h1>
            <p className="text-gray-600">Your recent prompt optimizations will appear here</p>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600 mb-4">
                Start optimizing prompts to see your recent work here. We'll keep your last 5 optimizations.
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Optimize Your First Prompt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prompt History</h1>
            <p className="text-gray-600">Your last {history.length} prompt optimizations</p>
          </div>
          
          {history.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            History is stored locally in your browser and automatically limited to your 5 most recent optimizations.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <CardTitle className="text-lg">{formatTimestamp(item.timestamp)}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {item.improvement}% improvement
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item.originalPrompt, 'original')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item.optimizedPrompt, 'optimized')}
                    className="border-brand-primary text-brand-primary hover:bg-brand-primary/5"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Optimized
                  </Button>
                </div>

                {/* Expandable Content */}
                <Collapsible 
                  open={expandedItems.has(item.id)} 
                  onOpenChange={() => toggleExpanded(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto text-gray-600 hover:text-gray-900"
                    >
                      {expandedItems.has(item.id) ? (
                        <ChevronDown className="w-4 h-4 mr-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2" />
                      )}
                      <FileText className="w-4 h-4 mr-2" />
                      View Full Prompts
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Original Prompt */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-gray-900">Original</h4>
                          <RatingLight prompt={item.originalPrompt} />
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border max-h-48 overflow-y-auto">
                          {item.originalPrompt}
                        </div>
                      </div>

                      {/* Optimized Prompt */}
                      <div className="bg-brand-primary/5 p-4 rounded-lg border border-brand-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-brand-primary">Optimized</h4>
                          <RatingLight prompt={item.optimizedPrompt} />
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-3 rounded border border-brand-primary/20 max-h-48 overflow-y-auto">
                          {cleanMarkdown(item.optimizedPrompt)}
                        </div>
                      </div>
                    </div>

                    {/* Context if available */}
                    {item.contextText && (
                      <div className="mt-4 bg-gray-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-2">Context Used</h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {item.contextText}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}