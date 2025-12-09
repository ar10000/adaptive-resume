/**
 * Claude API configuration
 * Uses the latest available Claude 3.5 Sonnet model (without date suffix)
 * This automatically uses the most recent version available
 * Can be overridden via CLAUDE_MODEL environment variable
 */
export const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL || "claude-3-5-sonnet";

