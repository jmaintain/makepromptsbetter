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
    if (score >= 7) return "shadow-green-500/50";
    if (score >= 4) return "shadow-yellow-500/50";
    return "shadow-red-500/50";
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
              "w-4 h-4 rounded-full transition-all duration-500 cursor-help",
              getRatingColor(rating?.rating),
              rating?.rating && "shadow-lg animate-pulse",
              getRatingGlow(rating?.rating),
              className
            )}
            style={{
              animation: rating?.rating ? "glow 2s ease-in-out infinite alternate" : undefined,
            }}
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