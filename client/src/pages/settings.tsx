import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const { user } = useAuth();

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

      <div className="grid lg:grid-cols-2 gap-8">
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
              <p className="text-gray-900">{user.email || 'Not available'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{user.id || 'Not available'}</p>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}