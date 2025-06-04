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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { TokenBalanceDisplay } from "@/components/token-balance-display";
import { Zap, Settings, LogOut, User, Menu, History, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { UserStats } from "@/../../shared/schema";

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  // Check if user has unsaved results
  const hasUnsavedResults = () => {
    if (location !== "/results") return false;
    const stored = sessionStorage.getItem("promptResult");
    return stored && !localStorage.getItem("resultSecured");
  };

  // Protected navigation handler
  const handleNavigation = (targetPath: string) => {
    if (hasUnsavedResults()) {
      const shouldProceed = window.confirm(
        "⚠️ WARNING: You have an unsaved optimization result that cost you credits!\n\nIf you navigate away without copying or saving, you'll lose it forever.\n\nAre you sure you want to leave?"
      );
      if (!shouldProceed) {
        return;
      }
    }
    setLocation(targetPath);
    setMobileMenuOpen(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Prompt Optimizer" },
      { path: "/prompt-school", label: "Prompt School", tier: "starter" },
    ];
    
    // AI Assistant Builder is intentionally hidden from navigation
    // Routes remain functional for internal access (/ai-assistant-builder, /persona-builder, /my-assistants)
    
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
    <header className="border-b bg-white sticky top-0 z-40 mobile-nav">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNavigation("/")} className="hover:opacity-80">
            <Logo />
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location === item.path
                    ? "text-blue-600 border-b-2 border-blue-600 pb-4"
                    : "text-gray-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Token Balance Display */}
            {user && (
              <div className="hidden md:block">
                <TokenBalanceDisplay variant="compact" />
              </div>
            )}
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="py-6">
                    <nav className="space-y-4">
                      {navItems.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                            location === item.path
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>
                    
                    {user && (
                      <div className="mt-6">
                        <TokenBalanceDisplay variant="full" showPurchaseButton={true} />
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {user ? (
              <>


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
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleNavigation("/prompt-history")} 
                      className="flex items-center cursor-pointer"
                    >
                      <History className="mr-2 h-4 w-4" />
                      <span>Prompt History</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleNavigation("/settings")} 
                      className="flex items-center cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => {
                        if (hasUnsavedResults()) {
                          const shouldProceed = window.confirm(
                            "⚠️ WARNING: You have an unsaved optimization result that cost you credits!\n\nIf you log out without copying or saving, you'll lose it forever.\n\nAre you sure you want to log out?"
                          );
                          if (!shouldProceed) {
                            return;
                          }
                        }
                        window.location.href = '/api/logout';
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}