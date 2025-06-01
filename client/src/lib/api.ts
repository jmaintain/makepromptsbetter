import { apiRequest } from "./queryClient";
import type { OptimizePromptRequest, OptimizePromptResponse, CreditsStatus, RatePromptRequest, RatePromptResponse, CreatePersonaRequest, CreatePersonaResponse, EnhancePersonaRequest, EnhancePersonaResponse } from "@shared/schema";

export async function optimizePrompt(request: OptimizePromptRequest): Promise<OptimizePromptResponse> {
  const response = await apiRequest("POST", "/api/optimize", request);
  return response.json();
}

export async function getCreditsStatus(): Promise<CreditsStatus> {
  const response = await apiRequest("GET", "/api/credits");
  return response.json();
}

export async function ratePrompt(request: RatePromptRequest): Promise<RatePromptResponse> {
  const response = await apiRequest("POST", "/api/rate", request);
  return response.json();
}

export async function createPersona(request: CreatePersonaRequest): Promise<CreatePersonaResponse> {
  const response = await apiRequest("POST", "/api/personas", request);
  return response.json();
}

export async function enhancePersona(personaId: number, request: EnhancePersonaRequest): Promise<EnhancePersonaResponse> {
  const response = await apiRequest("POST", `/api/personas/${personaId}/enhance`, request);
  return response.json();
}
