import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, CreditCard, Star, Zap, Crown, Users, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTokenPackages, createCheckoutSession, getTokenBalance } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TokenPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPackageIcon = (name: string) => {
  switch (name) {
    case 'starter': return <Zap className="h-5 w-5" />;
    case 'regular': return <Users className="h-5 w-5" />;
    case 'pro': return <Star className="h-5 w-5" />;
    case 'power': return <Crown className="h-5 w-5" />;
    default: return <Coins className="h-5 w-5" />;
  }
};

export function TokenPurchaseModal({ open, onOpenChange }: TokenPurchaseModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['/api/token-packages'],
    queryFn: getTokenPackages,
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ['/api/token-balance'],
    queryFn: getTokenBalance,
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async (packageId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase tokens",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    const successUrl = `${window.location.origin}/?payment=success`;
    const cancelUrl = `${window.location.origin}/?payment=cancelled`;

    checkoutMutation.mutate({
      packageId,
      successUrl,
      cancelUrl,
    });
  };

  if (packagesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-blue-600" />
            Purchase Optimization Tokens
          </DialogTitle>
          <DialogDescription>
            Get tokens to optimize your prompts. Each optimization uses 1 token.
            {tokenBalance && (
              <span className="block mt-2 font-medium text-blue-600">
                Current balance: {tokenBalance.balance} tokens
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {packages?.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${pkg.isPopular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {pkg.isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">
                  {getPackageIcon(pkg.name)}
                </div>
                <CardTitle className="text-lg">{pkg.displayName}</CardTitle>
                <div className="text-3xl font-bold">${pkg.priceUsd}</div>
                <CardDescription className="text-sm text-gray-600">
                  {pkg.tokens} optimizations
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-2">
                <div className="text-green-600 font-medium mb-2">
                  ${parseFloat(pkg.perTokenRate).toFixed(2)} each
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {pkg.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No expiration</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Instant delivery</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Secure payment</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${pkg.isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isProcessing || checkoutMutation.isPending}
                >
                  {isProcessing || checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy {pkg.displayName}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Secure Payment</h3>
          <p className="text-sm text-gray-600 mb-2">
            All payments are processed securely through Stripe. We never store your payment information.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>• SSL Encrypted</span>
            <span>• PCI Compliant</span>
            <span>• Money-back Guarantee</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}