import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/layout";
import { PersonaBuilderRoute } from "@/components/persona-builder-route";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import Settings from "@/pages/settings";
import Results from "@/pages/results";
import PromptSchool from "@/pages/prompt-school";
import PersonaBuilder from "@/pages/persona-builder";
import MyAssistants from "@/pages/my-assistants";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Home} />
          <Route path="/settings" component={Settings} />
          <Route path="/results" component={Results} />
          <Route path="/prompt-school" component={PromptSchool} />
          {/* Hidden AI Assistant Builder - keeping routes for internal access */}
          <Route path="/ai-assistant-builder" component={PersonaBuilderRoute} />
          <Route path="/my-assistants" component={MyAssistants} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
