import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrivacyNotice } from "@/components/privacy-notice";
import { Sparkles, Zap, Users, X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[95vh] overflow-y-auto mx-auto">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Start Your Free Trial
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Sparkles className="w-4 h-4 mr-1" />
              Free Trial Available
            </div>
            <p className="text-gray-600 text-sm">
              Sign in to unlock your free trial and start optimizing prompts instantly
            </p>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-900 mb-3 text-center">What you'll get:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-800">
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  <span>5 free optimization credits</span>
                </div>
                <div className="flex items-center gap-2 text-green-800">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span>Access to all optimization and Prompt School</span>
                </div>
                <div className="flex items-center gap-2 text-green-800">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>See live prompt ratings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <PrivacyNotice variant="full" className="mb-4" />

          <Button 
            onClick={handleLogin}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-3"
          >
            Start Free Trial
          </Button>

          <p className="text-xs text-gray-500 text-center">
            No credit card required • Start optimizing in seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}