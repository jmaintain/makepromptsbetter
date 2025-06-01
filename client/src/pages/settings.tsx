import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, LogOut, Crown, Zap, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const usagePercentage = userStats ? (userStats.monthlyUsage / userStats.monthlyLimit) * 100 : 0;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'starter': return <Zap className="h-5 w-5 text-blue-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'starter': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and subscription preferences</p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.firstName || user.lastName || 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Your current month's activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Monthly Prompts Used</span>
                      <span className="text-sm text-gray-600">
                        {userStats.monthlyUsage} / {userStats.monthlyLimit}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    {usagePercentage > 80 && (
                      <p className="text-sm text-orange-600 mt-2">
                        You're approaching your monthly limit. Consider upgrading for more prompts.
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Input Word Limit</label>
                      <p className="text-lg font-semibold">{userStats.wordLimitInput} words</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Response Limit</label>
                      <p className="text-lg font-semibold">
                        {userStats.wordLimitResponse ? `${userStats.wordLimitResponse} words` : 'Unlimited'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Subscription Information */}
          <div className="space-y-6">
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
                {userStats && (
                  <>
                    <div className="flex items-center gap-2">
                      {getTierIcon(userStats.tier)}
                      <Badge className={getTierColor(userStats.tier)}>
                        {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)} Plan
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Monthly Allocation</p>
                      <p className="text-lg font-semibold">{userStats.monthlyLimit} prompts</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Rate Limit</p>
                      <p className="text-lg font-semibold">
                        1 request per {userStats.rateLimitSeconds} seconds
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Usage Resets</p>
                      <p className="text-lg font-semibold">
                        {new Date(userStats.usageResetDate).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                {userStats?.tier === 'free' && (
                  <div className="pt-4">
                    <Button className="w-full">
                      Upgrade to Starter
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Get 100 monthly prompts and more features
                    </p>
                  </div>
                )}

                {userStats?.tier === 'starter' && (
                  <div className="pt-4">
                    <Button className="w-full">
                      Upgrade to Pro
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Get 500 monthly prompts and premium features
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Plan Features */}
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>What's included in your plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Basic persona generation
                    </li>
                    {userStats.tier !== 'free' && (
                      <>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Prompt School access
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Email support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Export personas
                        </li>
                      </>
                    )}
                    {userStats.tier === 'pro' && (
                      <>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Save up to 25 personas
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Priority support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Usage analytics
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}