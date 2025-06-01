import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { CheckCircle, Zap, Users, Shield } from "lucide-react";

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
          Craft Perfect AI Prompts
          <span className="text-blue-600"> Effortlessly</span>
        </h1>
        <p className="text-tagline font-body text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your basic prompts into powerful, optimized instructions that get better results from AI models. 
          Build custom personas and unlock the full potential of AI assistance.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = '/api/login'}>
            Get Started Free
          </Button>
          <Button variant="outline" size="lg">
            View Demo
          </Button>
        </div>
      </section>
      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-section-header font-heading text-center text-gray-900 mb-12">
          Everything you need to master AI prompts
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Smart Optimization</CardTitle>
              <CardDescription>
                Automatically improve your prompts with AI-powered suggestions that increase effectiveness by up to 71%
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Persona Builder</CardTitle>
              <CardDescription>
                Create custom AI personas tailored to your specific needs, from technical experts to creative assistants
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Track your prompt performance and usage patterns to continuously improve your AI interactions
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
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <CardDescription>Perfect for trying out the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>5 prompts per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Basic persona generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>200 word input limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '/api/login'}>
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Starter Tier */}
          <Card className="relative border-blue-200 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
              <div className="text-3xl font-bold">$4.99<span className="text-lg font-normal text-gray-600">/month</span></div>
              <CardDescription>Great for regular users</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>100 prompts per month</span>
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
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Export personas</span>
                </li>
              </ul>
              <Button className="w-full mt-6" onClick={() => window.location.href = '/api/login'}>
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
              <div className="text-3xl font-bold">$14.99<span className="text-lg font-normal text-gray-600">/month</span></div>
              <CardDescription>For power users and teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>500 prompts per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All Starter features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>500 word input limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Save 25 personas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Usage analytics</span>
                </li>
              </ul>
              <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '/api/login'}>
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
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