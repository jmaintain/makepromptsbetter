import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Lock } from "lucide-react";
import { formatTimeUntilReset } from "@/lib/credits";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditsResetTime?: string;
}

export function UpgradeModal({ open, onOpenChange, creditsResetTime }: UpgradeModalProps) {
  const timeUntilReset = creditsResetTime ? formatTimeUntilReset(creditsResetTime) : "18 hours";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-section-header font-heading text-center mb-4">
            You're out of free optimizations!
          </DialogTitle>
          <p className="text-center text-gray-600 font-body">
            Your prompts were improved by an average of <strong className="text-brand-primary">71%</strong>
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Starter */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-heading font-semibold text-gray-900 mb-2">Starter</h3>
            <div className="text-2xl font-heading font-bold text-gray-900 mb-1">$9</div>
            <div className="text-sm text-gray-600 mb-4 font-body">per month</div>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• 100 optimizations/month</li>
              <li>• Basic improvements</li>
              <li>• Email support</li>
            </ul>
            <Button variant="outline" className="w-full">
              Choose Starter
            </Button>
          </div>

          {/* Pro (Highlighted) */}
          <div className="border-2 border-brand-primary rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </span>
            </div>
            <h3 className="font-heading font-semibold text-brand-primary mb-2">Pro</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">$19</div>
            <div className="text-sm text-gray-600 mb-4">per month</div>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• Unlimited optimizations</li>
              <li>• Advanced AI improvements</li>
              <li>• Priority support</li>
              <li>• Export to all platforms</li>
            </ul>
            <Button className="w-full bg-brand-primary hover:bg-brand-secondary text-white">
              Choose Pro
            </Button>
          </div>

          {/* One-Time */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">One-Time</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">$29</div>
            <div className="text-sm text-gray-600 mb-4">one-time</div>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>• 500 optimization credits</li>
              <li>• Never expire</li>
              <li>• All features included</li>
            </ul>
            <Button variant="outline" className="w-full">
              Buy Credits
            </Button>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
            <Lock className="w-4 h-4" />
            Secure payment by Stripe • 7-day money-back guarantee
          </div>
          <Button
            variant="link"
            className="text-brand-primary hover:text-brand-secondary text-sm"
            onClick={() => onOpenChange(false)}
          >
            Maybe later – new credits in {timeUntilReset}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
