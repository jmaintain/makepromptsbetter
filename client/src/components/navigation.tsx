import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { Zap, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home" },
      { path: "/prompt-school", label: "Prompt School", tier: "starter" },
    ];
    
    if (userStats?.tier === 'pro') {
      baseItems.push({ path: "/persona-builder", label: "Persona Builder", tier: "pro" });
    }
    
    return baseItems;
  };

  const navItems = getNavItems();

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-yellow-100 text-yellow-800';
      case 'starter': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8">
              <Logo />
            </div>
            <span className="text-xl font-bold text-gray-900">makepromptsbetter</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === item.path
                    ? "text-blue-600 border-b-2 border-blue-600 pb-4"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Pro upgrade hint */}
            {userStats?.tier !== 'pro' && (
              <Link href="/persona-builder" className="relative group">
                <span className="text-sm font-medium text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                  Persona Builder
                </span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Upgrade to Pro to unlock
                </div>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Usage Badge */}
            {userStats && (
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline">
                  {userStats.monthlyUsage}/{userStats.monthlyLimit} prompts
                </Badge>
                <Badge className={getTierBadgeColor(userStats.tier)}>
                  {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)}
                </Badge>
              </div>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  {userStats && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {userStats.tier.charAt(0).toUpperCase() + userStats.tier.slice(1)} Plan
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}