import { Shield, Clock, Trash2, Lock, Eye, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Privacy First
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We believe your data belongs to you. Here's exactly how we protect it.
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: December 2024</p>
          </div>

          {/* Key Commitments */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5" />
                Our Privacy Commitments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900">Zero Data Misuse</h3>
                    <p className="text-green-800 text-sm">We never sell, share, or use your prompts for AI training</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900">Auto-Deletion</h3>
                    <p className="text-green-800 text-sm">All data automatically deleted after 30 days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900">Full Transparency</h3>
                    <p className="text-green-800 text-sm">Clear information about what data we collect and why</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-900">Your Control</h3>
                    <p className="text-green-800 text-sm">Request immediate deletion anytime</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Data We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Badge variant="outline">Essential</Badge>
                  Prompts and Context
                </h3>
                <p className="text-gray-600 mb-2">
                  We temporarily store the prompts you submit for optimization and any context you provide. This data is:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Used only to generate optimized versions of your prompts</li>
                  <li>• Never shared with third parties</li>
                  <li>• Never used to train AI models</li>
                  <li>• Automatically deleted after 30 days</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Badge variant="outline">Account</Badge>
                  User Information
                </h3>
                <p className="text-gray-600 mb-2">
                  When you create an account, we collect:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• Email address (for account access)</li>
                  <li>• Name (optional, for personalization)</li>
                  <li>• Usage statistics (for billing and limits)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Badge variant="outline">Technical</Badge>
                  System Information
                </h3>
                <p className="text-gray-600 mb-2">
                  For security and service improvement:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• IP address and browser information (for fraud prevention)</li>
                  <li>• Usage patterns (aggregated and anonymized)</li>
                  <li>• Error logs (no personal data)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Data Retention Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Automatic Deletion Schedule</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Prompt optimizations:</span>
                      <Badge className="bg-blue-100 text-blue-800">30 days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Unsaved AI assistants:</span>
                      <Badge className="bg-blue-100 text-blue-800">30 days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Usage logs:</span>
                      <Badge className="bg-blue-100 text-blue-800">90 days</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Saved AI assistants:</span>
                      <Badge className="bg-green-100 text-green-800">Until you delete</Badge>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">
                  Our automated system runs daily cleanup to ensure old data is permanently removed. 
                  You can also request immediate deletion of all your data at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Delivery</h3>
                    <p className="text-gray-600 text-sm">Process and optimize your prompts using OpenAI's API</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Account Management</h3>
                    <p className="text-gray-600 text-sm">Manage your usage limits and billing</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Improvement</h3>
                    <p className="text-gray-600 text-sm">Analyze aggregated, anonymized usage patterns to improve our service</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    What We DON'T Do
                  </h3>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• We don't sell your data to third parties</li>
                    <li>• We don't use your prompts to train AI models</li>
                    <li>• We don't share your content with other users</li>
                    <li>• We don't use your data for advertising</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Access</h3>
                  <p className="text-gray-600 text-sm">
                    You can view all your stored data through your account dashboard.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
                  <p className="text-gray-600 text-sm">
                    Request immediate deletion of all your data through your settings page or by contacting support.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                  <p className="text-gray-600 text-sm">
                    Request a copy of your data in a machine-readable format.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Need help?</strong> Contact us at privacy@promptoptimizer.com for any privacy-related questions or requests.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Have questions about our privacy practices? We're here to help.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@promptoptimizer.com</p>
                <p><strong>Response time:</strong> Within 48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}