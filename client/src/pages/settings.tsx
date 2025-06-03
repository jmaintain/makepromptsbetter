import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PrivacyNotice } from "@/components/privacy-notice";
import { LogOut, User, CreditCard, Shield, Trash2, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch user's data summary
  const { data: dataSummary, isLoading: loadingData } = useQuery({
    queryKey: ['/api/privacy/data-summary'],
    enabled: !!user,
  });

  // Delete user data mutation
  const deleteDataMutation = useMutation({
    mutationFn: () => apiRequest('/api/privacy/delete-my-data', { method: 'DELETE' }),
    onSuccess: (data) => {
      toast({
        title: "Data Deleted Successfully",
        description: `Deleted ${data.deletedOptimizations} optimizations and ${data.deletedPersonas} personas.`,
      });
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete your data. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-section-header font-heading text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2 font-body">Manage your account and privacy preferences</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/api/logout'}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="font-heading">Profile Information</CardTitle>
              <CardDescription className="font-body">Your account details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 font-body">Email Address</label>
              <p className="text-gray-900 font-body">{user.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 font-body">User ID</label>
              <p className="text-gray-900 font-code text-sm">{user.id || 'Not available'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Plan</label>
              <p className="text-gray-900">Free (Default)</p>
            </div>
            <Button className="w-full">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Privacy & Data Management</CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Your Data Summary
              </h3>
              {loadingData ? (
                <p className="text-gray-600 text-sm">Loading data summary...</p>
              ) : dataSummary ? (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prompt optimizations:</span>
                    <Badge variant="outline">{dataSummary.totalOptimizations}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI assistants created:</span>
                    <Badge variant="outline">{dataSummary.totalPersonas}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention policy:</span>
                    <Badge className="bg-blue-100 text-blue-800">30 days</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data usage:</span>
                    <Badge className="bg-green-100 text-green-800">Optimization only</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Unable to load data summary</p>
              )}
            </div>

            {/* Auto-Deletion Info */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Automatic Data Deletion:</strong> Your prompts and optimizations are automatically deleted after 30 days. 
                Unsaved AI assistants are also removed after 30 days to protect your privacy.
              </AlertDescription>
            </Alert>

            {/* Privacy Notice */}
            <PrivacyNotice variant="full" />

            {/* Data Deletion Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete All My Data
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Permanently delete all your prompts, optimizations, and AI assistants immediately. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Request Data Deletion
                </Button>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <p className="text-red-800 mb-3">
                      <strong>Are you sure?</strong> This will permanently delete all your data and cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteDataMutation.mutate()}
                        disabled={deleteDataMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {deleteDataMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            Yes, Delete All Data
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteDataMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Privacy Policy Link */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm mb-3">
                Read our complete privacy policy to understand how we protect your data.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                View Privacy Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}