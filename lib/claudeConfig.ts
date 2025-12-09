/**
 * Claude API configuration
 * Uses the latest stable Claude 3.5 Sonnet model
 * Can be overridden via CLAUDE_MODEL environment variable
 * 
 * Available models (as of 2024):
 * - claude-3-5-sonnet-20240620 (stable, recommended)
 * - claude-3-opus-20240229
 * - claude-3-sonnet-20240229
 * - claude-3-haiku-20240307
 */
export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20240620";

