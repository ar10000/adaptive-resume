/**
 * Claude API configuration
 * Defaults to the latest stable Claude 3.5 Sonnet model
 * Can be overridden via CLAUDE_MODEL environment variable
 */
export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20240620";

