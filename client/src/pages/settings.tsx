import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrivacyNotice } from "@/components/privacy-notice";
import { LogOut, User, CreditCard, Shield, AlertTriangle, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { UserStats, TokenBalance } from "@shared/schema";

export default function Settings() {
  const { user } = useAuth();

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: !!user,
  });

  const { data: tokenBalance } = useQuery<TokenBalance>({
    queryKey: ['/api/token-balance'],
    enabled: !!user,
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

        {/* Token Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Token Balance</CardTitle>
              <CardDescription>Your available tokens for optimizations</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Balance</label>
              <p className="text-2xl font-bold text-gray-900">{tokenBalance?.balance || 0} tokens</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Account Tier</label>
              <p className="text-gray-900 capitalize">
                {userStats?.tier ? `${userStats.tier.charAt(0).toUpperCase()}${userStats.tier.slice(1)}` : 'Loading...'}
              </p>
            </div>
            <Button className="w-full" onClick={() => window.location.href = '/#purchase'}>
              Buy More Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>How we protect your privacy</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Privacy Notice */}
            <PrivacyNotice variant="full" />

            {/* Browser Storage Info */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Browser Storage:</strong> Your optimization results are temporarily cached in your browser for convenience. 
                Clear your browser data to remove these cached results.
              </AlertDescription>
            </Alert>

            {/* Privacy Policy Link */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm mb-3">
                Read our complete privacy policy to understand our zero-storage approach.
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