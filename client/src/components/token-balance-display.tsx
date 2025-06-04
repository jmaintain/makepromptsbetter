import { useQuery } from "@tanstack/react-query";
import { getTokenBalance } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Plus, History } from "lucide-react";
import { useState } from "react";
import { TokenPurchaseModal } from "./token-purchase-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TokenBalanceDisplayProps {
  className?: string;
  showPurchaseButton?: boolean;
  variant?: "compact" | "full";
}

export function TokenBalanceDisplay({ 
  className = "", 
  showPurchaseButton = true,
  variant = "compact"
}: TokenBalanceDisplayProps) {
  const { user } = useAuth();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const { data: tokenBalance, isLoading } = useQuery({
    queryKey: ['/api/token-balance'],
    queryFn: getTokenBalance,
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              {tokenBalance?.balance || 0} tokens
            </span>
          </div>
          {showPurchaseButton && (
            <Button
              size="sm"
              onClick={() => setPurchaseModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Buy More
            </Button>
          )}
        </div>
        <TokenPurchaseModal 
          open={purchaseModalOpen} 
          onOpenChange={setPurchaseModalOpen} 
        />
      </>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Coins className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Token Balance</h3>
                <p className="text-xs text-gray-600">Available optimizations</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">
                {tokenBalance?.balance || 0}
              </div>
              <div className="text-xs text-gray-500">tokens</div>
            </div>
          </div>

          <div className="flex gap-2">
            {showPurchaseButton && (
              <Button
                onClick={() => setPurchaseModalOpen(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[44px]"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Purchase Tokens
              </Button>
            )}
            
            <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                  <History className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Transaction History</DialogTitle>
                  <DialogDescription>
                    Your recent token transactions and usage
                  </DialogDescription>
                </DialogHeader>
                
                <div className="max-h-96 overflow-y-auto">
                  {tokenBalance?.transactions?.length ? (
                    <div className="space-y-3">
                      {tokenBalance.transactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                              {new Date(transaction.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No transactions yet
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(tokenBalance?.balance || 0) === 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You're out of tokens! Purchase more to continue optimizing your prompts.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TokenPurchaseModal 
        open={purchaseModalOpen} 
        onOpenChange={setPurchaseModalOpen} 
      />
    </>
  );
}