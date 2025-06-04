import { Shield, Lock, Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PrivacyNoticeProps {
  variant?: "compact" | "full";
  className?: string;
}

export function PrivacyNotice({ variant = "compact", className = "" }: PrivacyNoticeProps) {
  if (variant === "compact") {
    return (
      <div className={`text-xs text-gray-500 space-y-1 text-center ${className}`}>
        <div className="flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Your prompts are never stored on our servers</span>
        </div>
        <p>Maximum privacy: prompts are processed and discarded immediately. Results cached in your browser only.</p>
      </div>
    );
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Your Privacy Matters</h3>
        </div>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Zero Data Storage:</strong> Your prompts are never stored on our servers. They're processed and discarded immediately.
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Browser Only:</strong> Results are cached in your browser temporarily for your convenience.
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Complete Privacy:</strong> No data to delete since nothing is stored on our servers.
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            Read our full{" "}
            <button 
              onClick={() => window.open('/privacy-policy', '_blank')}
              className="underline hover:no-underline font-medium"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}