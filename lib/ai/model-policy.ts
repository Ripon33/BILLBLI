import type { AIIntelligenceMode } from "./capability";

export interface AIModelPolicy {
  mode: AIIntelligenceMode;
  provider: "openai";
  model: string;
}

const MODEL_POLICY: Record<AIIntelligenceMode, AIModelPolicy> = {
  auto: {
    mode: "auto",
    provider: "openai",
    model: "gpt-5.6-luna",
  },
  fast: {
    mode: "fast",
    provider: "openai",
    model: "gpt-5.6-luna",
  },
  balanced: {
    mode: "balanced",
    provider: "openai",
    model: "gpt-5.6-luna",
  },
  best_quality: {
    mode: "best_quality",
    provider: "openai",
    model: "gpt-5.6-luna",
  },
};

export function getAIModelPolicy(
  mode: AIIntelligenceMode,
): AIModelPolicy {
  return MODEL_POLICY[mode];
}
