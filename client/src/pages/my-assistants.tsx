import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Calendar, TestTube, Trash2, Edit, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SavedAssistant {
  id: number;
  name: string;
  generatedPersona: string;
  originalInput: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyAssistants() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAssistant, setSelectedAssistant] = useState<SavedAssistant | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPrompt, setTestPrompt] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const { data: savedAssistants = [], isLoading } = useQuery({
    queryKey: ["/api/my-assistants"],
    enabled: !!user,
  });

  const handleCopyPersona = (persona: string) => {
    navigator.clipboard.writeText(persona);
    toast({
      title: "Persona copied!",
      description: "The AI assistant persona has been copied to your clipboard.",
    });
  };

  const handleTestAssistant = (assistant: SavedAssistant) => {
    setSelectedAssistant(assistant);
    setShowTestModal(true);
    setTestPrompt("");
    setTestResponse("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading your saved assistants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My AI Assistants
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and test your saved AI assistants
            </p>
          </div>
          <Button onClick={() => window.location.href = '/ai-assistant-builder'}>
            <Bot className="mr-2 h-4 w-4" />
            Create New Assistant
          </Button>
        </div>

        {/* Saved Assistants Grid */}
        {savedAssistants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedAssistants.map((assistant) => (
              <Card key={assistant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{assistant.name}</CardTitle>
                    <Badge variant="secondary">Saved</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {assistant.originalInput}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(assistant.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestAssistant(assistant)}
                    >
                      <TestTube className="mr-2 h-3 w-3" />
                      Test
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyPersona(assistant.generatedPersona)}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Saved Assistants Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create and save AI assistants to access them here. Your saved assistants will appear in this library.
              </p>
              <Button onClick={() => window.location.href = '/ai-assistant-builder'}>
                <Bot className="mr-2 h-4 w-4" />
                Create Your First Assistant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pro Feature Notice */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                  Upgrade to Pro for Full Assistant Management
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-sm mt-1">
                  Save up to 25 AI assistants, test them anytime, and organize your workflow with advanced management tools.
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Dialog */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Assistant: {selectedAssistant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPrompt">Enter a prompt to test:</Label>
              <Textarea
                id="testPrompt"
                placeholder="Ask your assistant something..."
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button className="w-full" disabled>
              Test Assistant
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}