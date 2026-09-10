import type {
  AIRequest,
  AIResult,
} from "./capability";

export type { AIRequest, AIResult } from "./capability";

export interface AIProvider {
  readonly name: string;
  generate(request: AIRequest): Promise<AIResult>;
}
