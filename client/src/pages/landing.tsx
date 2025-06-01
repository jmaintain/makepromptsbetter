import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { CheckCircle, Gauge, Bot, MessageSquarePlus } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Button onClick={() => window.location.href = '/api/login'}>
            Sign In
          </Button>
        </div>
      </header>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Prompt Optimization
        </Badge>
        <h1 className="text-main-title font-heading text-gray-900 mb-6">
          Say what you want.
          <span className="text-blue-600"> Get exactly what you mean</span>
        </h1>
        <p className="text-tagline font-body text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your basic prompts into powerful, optimized instructions that get better results from AI models. 
          Build custom personas and unlock the full potential of AI assistance.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = '/api/login'}>
            Sign Up for Free
          </Button>
          <Button variant="outline" size="lg">
            View Demo
          </Button>
        </div>
      </section>
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-section-header font-heading text-center text-gray-900 mb-12">
          Get 5 FREE improvements per month with signup!
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Gauge className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Optimization</CardTitle>
              <CardDescription>
                Automatically improve your prompts with AI-powered suggestions that increase effectiveness by up to 71%
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Bot className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>AI Assistant Builder (PRO)</CardTitle>
              <CardDescription>
                Create custom AI assistants/personas tailored to your specific needs, from technical experts to creative assistants
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquarePlus className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Enhanced Prompting with Context</CardTitle>
              <CardDescription>
                Add relevant context to your prompts to get more tailored and useful responses. Including background information & specific requirements gets you closer to exactly what you need.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-section-header font-heading text-center text-gray-900 mb-12">
          Simple, transparent pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Free</CardTitle>
              <div className="text-3xl font-heading font-bold">$0</div>
              <CardDescription className="font-body">Perfect for trying out the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 font-body">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>5 improvements per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Prompt School Learning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>200 word input limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Prompt + Context</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '/api/login'}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier - Most Popular */}
          <Card className="relative border-2 border-blue-500 shadow-xl scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white font-heading">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-heading text-blue-600">Pro</CardTitle>
              <div className="text-3xl font-heading font-bold">$14.99<span className="text-lg font-normal text-gray-600">/month</span></div>
              <CardDescription className="font-body">For an AI optimized Workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 font-body">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>500 improvements per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All Free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>500 word input limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Save 50 AI Prompts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Save 25 AI Assistants</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Create and Test AI Assistants</span>
                </li>
              </ul>
              <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/api/login'}>
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>

          {/* Starter Tier */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Starter</CardTitle>
              <div className="text-3xl font-heading font-bold">$4.99<span className="text-lg font-normal text-gray-600">/month</span></div>
              <CardDescription className="font-body">Great for regular users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 font-body">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>100 improvements per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All Free features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>300 word input limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Prompt + Context</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '/api/login'}>
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4 text-white">
            <Logo />
          </div>
          <p className="text-gray-400">
            Enhance your AI interactions with optimized prompts and custom personas.
          </p>
        </div>
      </footer>
    </div>
  );
}