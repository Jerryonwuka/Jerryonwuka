/**
 * Per-run cost accounting. Rates are USD per million tokens, first-party
 * Anthropic API pricing. Wrong numbers here are worse than none, so an
 * unknown model is priced at 0 rather than guessed.
 */
import type { Usage } from './types.ts';

const RATES: Record<string, { in: number; out: number }> = {
  'claude-opus-5': { in: 5, out: 25 },
  'claude-sonnet-5': { in: 2, out: 10 },
  'claude-haiku-4-5': { in: 1, out: 5 },
};

export function priceOf(modelId: string, usage: Usage): number {
  const rate = RATES[modelId];
  if (!rate) return 0;
  return (usage.inputTokens * rate.in + usage.outputTokens * rate.out) / 1_000_000;
}

export function knownModels(): string[] {
  return Object.keys(RATES);
}
