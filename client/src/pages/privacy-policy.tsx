import { Shield, Lock, Eye, Users, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
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
            Maximum privacy with zero server storage. Here's how we protect you.
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
                  <h3 className="font-semibold text-green-900">Zero Data Storage</h3>
                  <p className="text-green-800 text-sm">Your prompts are never stored on our servers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Process & Discard</h3>
                  <p className="text-green-800 text-sm">Prompts processed immediately then deleted</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Browser Only</h3>
                  <p className="text-green-800 text-sm">Results cached in your browser temporarily</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Your Control</h3>
                  <p className="text-green-800 text-sm">Clear browser data to remove all traces</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What We DON'T Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700">Never Stored</Badge>
                Your Prompts
              </h3>
              <p className="text-gray-600 mb-2">
                Your original prompts and optimized results are:
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Processed in memory only</li>
                <li>• Never written to database</li>
                <li>• Discarded immediately after processing</li>
                <li>• Only cached in your browser temporarily</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">Minimal Storage</Badge>
                Account Information
              </h3>
              <p className="text-gray-600 mb-2">
                When you create an account, we only store:
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Email address (for account access)</li>
                <li>• Name (optional, for personalization)</li>
                <li>• Usage counts (for billing and limits)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Anonymous</Badge>
                System Information
              </h3>
              <p className="text-gray-600 mb-2">
                For security and service improvement:
              </p>
              <ul className="text-gray-600 text-sm space-y-1 ml-4">
                <li>• Anonymous usage counts (no content)</li>
                <li>• Error logs (no personal data)</li>
                <li>• Performance metrics (aggregated)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Processing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              How We Process Your Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Zero-Storage Architecture</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span>Your prompt is received in server memory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span>Processed immediately using OpenAI API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span>Result sent to your browser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <span>All data discarded from server memory</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                Your prompts exist on our servers for seconds only - just long enough to process and return results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">OpenAI Processing</h3>
                  <p className="text-gray-600 text-sm">Your prompts are sent to OpenAI for optimization, subject to their privacy policy</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Authentication</h3>
                  <p className="text-gray-600 text-sm">Login handled by Replit's secure authentication system</p>
                </div>
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
                  Since prompts aren't stored, there's no prompt data to access. Account information is viewable in your settings.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
                <p className="text-gray-600 text-sm">
                  Prompts are automatically discarded. Clear your browser cache to remove locally stored results.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Portability</h3>
                <p className="text-gray-600 text-sm">
                  Copy your optimization results from the browser before leaving the page.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Questions?</strong> Contact us at privacy@promptoptimizer.com for any privacy-related inquiries.
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
              Have questions about our zero-storage privacy approach? We're here to help.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> privacy@promptoptimizer.com</p>
              <p><strong>Response time:</strong> Within 48 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}