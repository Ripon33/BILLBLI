export const AI_CAPABILITIES = [
  "text",
  "structured_json",
  "reasoning",
  "research",
] as const;

export type AICapability = (typeof AI_CAPABILITIES)[number];

export type AIIntelligenceMode =
  | "auto"
  | "fast"
  | "balanced"
  | "best_quality";

export interface AIRequest {
  capability: AICapability;
  mode: AIIntelligenceMode;
  input: string;
}

export interface AIResult {
  text: string;
}
