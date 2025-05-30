import { useQuery } from "@tanstack/react-query";
import { ratePrompt } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface RatingLightProps {
  prompt: string;
  className?: string;
}

export function RatingLight({ prompt, className }: RatingLightProps) {
  const isMobile = useIsMobile();
  const { data: rating, isLoading } = useQuery({
    queryKey: ["/api/rate", prompt],
    queryFn: () => ratePrompt({ prompt }),
    enabled: !!prompt,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getRatingColor = (score?: number) => {
    if (!score) return "bg-gray-400";
    if (score >= 7) return "bg-green-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRatingGlow = (score?: number) => {
    if (!score) return "";
    if (score >= 7) return "shadow-sm shadow-green-500/30";
    if (score >= 4) return "shadow-sm shadow-yellow-500/30";
    return "shadow-sm shadow-red-500/30";
  };

  const getRatingLabel = (score?: number) => {
    if (!score) return "Unknown";
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 4) return "Fair";
    return "Poor";
  };

  if (isLoading) {
    return (
      <div className={cn("w-3 h-3 rounded-full bg-gray-300 animate-pulse", className)} />
    );
  }

  const ratingContent = (
    <div className="text-sm">
      <div className="font-medium mb-2 flex items-center gap-2">
        <span>Prompt Quality</span>
        <Badge variant={rating?.rating && rating.rating >= 7 ? "default" : "secondary"}>
          {rating?.rating || "N/A"}/10 · {getRatingLabel(rating?.rating)}
        </Badge>
      </div>
      <div className="text-gray-600 leading-relaxed">
        {rating?.reason || "Unable to rate prompt"}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0 touch-manipulation",
              getRatingColor(rating?.rating),
              getRatingGlow(rating?.rating),
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              className
            )}
            aria-label={`View prompt rating: ${rating?.rating || "N/A"}/10`}
          />
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          {ratingContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 cursor-help flex-shrink-0",
              getRatingColor(rating?.rating),
              getRatingGlow(rating?.rating),
              className
            )}
            aria-label={`Prompt rating: ${rating?.rating || "N/A"}/10`}
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {ratingContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}