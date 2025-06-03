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
import PromptHistory from "@/pages/prompt-history";
import PrivacyPolicy from "@/pages/privacy-policy";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, isError } = useAuth();

  // If there's an auth error (401), treat as unauthenticated
  const authState = isError ? false : isAuthenticated;

  return (
    <Switch>
      {isLoading && !isError ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        <Layout>
          <Route path="/" component={Home} />
          <Route path="/prompt-school" component={PromptSchool} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          {authState && (
            <>
              <Route path="/settings" component={Settings} />
              <Route path="/prompt-history" component={PromptHistory} />
              <Route path="/results" component={Results} />
              {/* Hidden AI Assistant Builder - keeping routes for internal access */}
              <Route path="/ai-assistant-builder" component={PersonaBuilderRoute} />
              <Route path="/persona-builder" component={PersonaBuilder} />
              <Route path="/my-assistants" component={MyAssistants} />
            </>
          )}
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
