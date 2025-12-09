/**
 * Claude API configuration
 * 
 * IMPORTANT: Set the CLAUDE_MODEL environment variable in Vercel to use the latest model.
 * 
 * To find the latest available Claude model:
 * 1. Check Anthropic's API documentation: https://docs.anthropic.com/claude/docs/models-overview
 * 2. Or check your Anthropic console: https://console.anthropic.com/
 * 
 * Common model formats:
 * - claude-3-5-sonnet-YYYYMMDD (e.g., claude-3-5-sonnet-20240620)
 * - claude-3-opus-YYYYMMDD
 * - claude-3-sonnet-YYYYMMDD
 * - claude-3-haiku-YYYYMMDD
 * 
 * The model name MUST include the full date suffix (YYYYMMDD format).
 * Simply using "claude-3-5-sonnet" without a date will NOT work.
 * 
 * To set in Vercel:
 * 1. Go to Project Settings → Environment Variables
 * 2. Add: CLAUDE_MODEL = claude-3-5-sonnet-20240620 (or your latest model)
 * 3. Redeploy
 */

// Default model - UPDATE THIS to the latest available model from Anthropic
// Or better yet, set it via CLAUDE_MODEL environment variable in Vercel
const DEFAULT_MODEL = "claude-3-5-sonnet-20240620";

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || DEFAULT_MODEL;

