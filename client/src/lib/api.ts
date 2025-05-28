import { apiRequest } from "./queryClient";
import type { OptimizePromptRequest, OptimizePromptResponse, CreditsStatus } from "@shared/schema";

export async function optimizePrompt(request: OptimizePromptRequest): Promise<OptimizePromptResponse> {
  const response = await apiRequest("POST", "/api/optimize", request);
  return response.json();
}

export async function getCreditsStatus(): Promise<CreditsStatus> {
  const response = await apiRequest("GET", "/api/credits");
  return response.json();
}
