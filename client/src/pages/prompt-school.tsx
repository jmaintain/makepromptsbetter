import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Target, Lightbulb, Code, FileText, Zap } from "lucide-react";

export default function PromptSchool() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <Logo />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-brand-primary/10 p-4 rounded-2xl">
                <BookOpen className="w-12 h-12 text-brand-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4 font-title">
              Prompt School
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Master the art of AI prompting with our comprehensive guide. Learn to create prompts that deliver precise, creative, and valuable results.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-accent" />
                    Core Benefits
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Get precise, targeted results</li>
                    <li>• Reduce back-and-forth refinements</li>
                    <li>• Unlock AI's creative potential</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-accent" />
                    Best For
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Content creation & marketing</li>
                    <li>• Technical documentation</li>
                    <li>• Creative projects & analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Good Prompts Matter */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Why Good Prompts Matter
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Every interaction with AI begins with a prompt. Think of it as the blueprint that determines what you'll build together. Just as detailed architectural plans lead to better buildings, well-crafted prompts lead to better AI outputs.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                Beyond Basic Instructions
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Many users approach AI with vague requests like "write a blog post about marketing" or "give me ideas for my business." These basic prompts often yield generic, underwhelming results. The difference between amateur and expert AI use often comes down to prompt quality.
              </p>
            </CardContent>
          </Card>

          {/* Prompt Formats */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Prompt Formats: Plain Text vs. XML
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Plain Text Prompts */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-brand-accent" />
                  <h3 className="text-xl font-semibold text-gray-800">Plain Text Prompts</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Natural language prompts that are conversational and accessible. Perfect for straightforward requests.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Example:</p>
                  <div className="bg-white p-4 rounded border-l-4 border-brand-primary font-mono text-sm">
                    "Act as an expert content strategist for a B2B SaaS company in the cybersecurity space. Create a content calendar for Q3 that includes blog topics, email newsletter themes, and social media post ideas..."
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Best Used When:</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Speed is more important than precision</li>
                    <li>• Your request is straightforward</li>
                    <li>• You're new to prompt engineering</li>
                    <li>• Using AI conversationally</li>
                  </ul>
                </div>
              </div>

              {/* XML Prompts */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Code className="w-6 h-6 text-brand-accent" />
                  <h3 className="text-xl font-semibold text-gray-800">XML Prompts</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Structured prompts using XML tags for precise control and complex instructions.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Example:</p>
                  <div className="bg-white p-4 rounded border-l-4 border-brand-primary font-mono text-sm">
                    {`<prompt>
<role>Expert Content Strategist</role>
<context>
<company_type>Cybersecurity SaaS</company_type>
<timeframe>Q3 planning</timeframe>
</context>
</prompt>`}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Best Used When:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Precision is critical</li>
                    <li>• Your request has multiple components</li>
                    <li>• You need consistent, repeatable results</li>
                    <li>• Integrating AI into workflows</li>
                  </ul>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-brand-primary/5 p-6 rounded-lg border border-brand-primary/20">
                <h4 className="font-semibold text-brand-primary mb-2">Our Recommendation</h4>
                <p className="text-gray-700">
                  For most professional use cases, we recommend XML-formatted prompts. While plain text is perfectly adequate for simple requests, XML delivers superior results for complex creative projects, technical documentation, and multi-component content creation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Tips */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Advanced Prompt Engineering Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Chain of Thought */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Chain of Thought</h3>
                <p className="text-gray-700 mb-4">
                  Guide the AI through a step-by-step reasoning process using explicitly marked reasoning sections:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="bg-white p-4 rounded border-l-4 border-brand-primary font-mono text-sm">
                    {`<reasoning>
<step>First, identify the key variables</step>
<step>Next, determine relationships</step>
<step>Finally, apply the formula</step>
</reasoning>`}
                  </div>
                </div>
              </div>

              {/* Few-Shot Learning */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Few-Shot Learning</h3>
                <p className="text-gray-700 mb-4">
                  Include examples of desired inputs and outputs to help the AI understand patterns:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="bg-white p-4 rounded border-l-4 border-brand-primary font-mono text-sm">
                    {`<examples>
<example>
<input>Customer complained about slow loading</input>
<output>Technical issue: Performance optimization needed</output>
</example>
</examples>`}
                  </div>
                </div>
              </div>

              {/* Controlled Creativity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Controlled Creativity</h3>
                <p className="text-gray-700 mb-4">
                  Set parameters for creative freedom while maintaining constraints:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="bg-white p-4 rounded border-l-4 border-brand-primary font-mono text-sm">
                    {`<creativity>
<tone range="professional-to-conversational">Slightly conversational</tone>
<innovation level="1-10">7</innovation>
<constraints>Must maintain compliance</constraints>
</creativity>`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Getting Started With Structured Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Even if you're new to XML, you can begin incorporating structure into your prompts:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">1</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Start with roles</h4>
                      <p className="text-sm text-gray-600">Clearly define what expertise the AI should emulate</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">2</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Separate context from instructions</h4>
                      <p className="text-sm text-gray-600">Distinguish background information from specific tasks</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">3</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Use numbered lists</h4>
                      <p className="text-sm text-gray-600">Help the AI follow multi-step processes</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">4</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Specify output formats</h4>
                      <p className="text-sm text-gray-600">Define exactly how you want information presented</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">5</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Include examples</h4>
                      <p className="text-sm text-gray-600">Show, don't just tell, what you expect</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Badge className="bg-brand-primary text-white">6</Badge>
                    <div>
                      <h4 className="font-medium text-gray-800">Build templates</h4>
                      <p className="text-sm text-gray-600">Create robust XML templates for common tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Using VCP */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand-primary">
                Using VCP: Your Guide to Enhanced Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                VCP makes it easy to transform basic ideas into powerful, structured prompts. Our tool helps you master prompt engineering without needing to learn all the technical details yourself.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Enter Your Idea</h3>
                  <p className="text-sm text-gray-600">
                    Start with simple requests like "Create a marketing email" or "Help me write Python code"
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Choose Options</h3>
                  <p className="text-sm text-gray-600">
                    Select depth level, format preference, and specialized focus for your enhanced prompt
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-brand-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-brand-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Get Enhanced Results</h3>
                  <p className="text-sm text-gray-600">
                    Receive reasoning analysis, enhanced plain text, and XML structure versions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Link href="/">
              <Button className="bg-brand-primary text-white px-8 py-3 hover:bg-brand-secondary">
                Start Improving Your Prompts
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}