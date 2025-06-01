import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Users, ArrowRight, Lock } from "lucide-react";
import PersonaBuilder from "@/pages/persona-builder";

export function PersonaBuilderRoute() {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  // If user is Pro, show the actual Persona Builder
  if (userStats?.tier === 'pro') {
    return <PersonaBuilder />;
  }

  // Show upgrade teaser for non-Pro users
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              Pro Feature
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Assistant Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create custom AI assistants tailored to your specific needs. Build experts, helpers, 
            and specialized assistants that understand your context and deliver exactly what you need.
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="relative">
            <div className="absolute top-4 right-4">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Smart AI Assistant Generation
              </CardTitle>
              <CardDescription>
                Transform simple descriptions into sophisticated AI assistants with detailed expertise and communication styles
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-600">
              <ul className="space-y-2">
                <li>• Advanced personality customization</li>
                <li>• Industry-specific knowledge bases</li>
                <li>• Custom communication preferences</li>
                <li>• Contextual response optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative">
            <div className="absolute top-4 right-4">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Enhanced Capabilities
              </CardTitle>
              <CardDescription>
                Save, test, and refine your personas with advanced tools and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-600">
              <ul className="space-y-2">
                <li>• Save up to 25 custom AI assistants</li>
                <li>• Real-time assistant testing</li>
                <li>• Performance analytics</li>
                <li>• Export and sharing options</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock the Full Potential
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upgrade to Pro and gain access to the AI Assistant Builder, plus 500 monthly prompts, 
              priority support, and advanced analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Current: {userStats?.tier?.charAt(0).toUpperCase() + userStats?.tier?.slice(1) || 'Free'} Plan</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-semibold text-blue-600">Pro Plan</span>
              </div>
            </div>
            
            <Button size="lg" className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Upgrade to Pro - $14.99/month
            </Button>
            
            <p className="text-xs text-gray-500 mt-3">
              Start building AI assistants instantly after upgrade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}