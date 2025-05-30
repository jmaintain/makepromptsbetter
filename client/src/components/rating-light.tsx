import { useQuery } from "@tanstack/react-query";
import { ratePrompt } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RatingLightProps {
  prompt: string;
  className?: string;
}

export function RatingLight({ prompt, className }: RatingLightProps) {
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

  if (isLoading) {
    return (
      <div className={cn("w-4 h-4 rounded-full bg-gray-300 animate-pulse", className)} />
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
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-sm">
            <div className="font-medium mb-1">
              Rating: {rating?.rating || "N/A"}/10
            </div>
            <div className="text-gray-600">
              {rating?.reason || "Unable to rate prompt"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}