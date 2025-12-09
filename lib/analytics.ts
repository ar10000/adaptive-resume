// Simple analytics tracking (use a proper analytics service in production)
interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// In-memory storage (use database in production)
const analyticsEvents: AnalyticsEvent[] = [];

/**
 * Track an analytics event
 */
export function trackEvent(type: string, data: Record<string, any> = {}) {
  const event: AnalyticsEvent = {
    type,
    data,
    timestamp: Date.now(),
  };
  analyticsEvents.push(event);

  // Keep only last 1000 events in memory
  if (analyticsEvents.length > 1000) {
    analyticsEvents.shift();
  }
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
  const matchScores: number[] = [];
  const missingSkills: string[] = [];
  let generationSuccess = 0;
  let generationTotal = 0;

  analyticsEvents.forEach((event) => {
    if (event.type === "match_analysis") {
      if (event.data.overallScore !== undefined) {
        matchScores.push(event.data.overallScore);
      }
      if (event.data.missingKeywords) {
        missingSkills.push(...event.data.missingKeywords);
      }
    }
    if (event.type === "resume_generation") {
      generationTotal++;
      if (event.data.success) {
        generationSuccess++;
      }
    }
  });

  // Count most common missing skills
  const skillCounts: Record<string, number> = {};
  missingSkills.forEach((skill) => {
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
  });

  const mostCommonMissingSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  const averageMatchScore =
    matchScores.length > 0
      ? matchScores.reduce((a, b) => a + b, 0) / matchScores.length
      : 0;

  const generationSuccessRate =
    generationTotal > 0 ? (generationSuccess / generationTotal) * 100 : 0;

  return {
    averageMatchScore: Math.round(averageMatchScore * 10) / 10,
    mostCommonMissingSkills,
    generationSuccessRate: Math.round(generationSuccessRate * 10) / 10,
    totalAnalyses: matchScores.length,
    totalGenerations: generationTotal,
  };
}

/**
 * Track match analysis
 */
export function trackMatchAnalysis(analysis: {
  overallScore: number;
  missingKeywords: string[];
}) {
  trackEvent("match_analysis", {
    overallScore: analysis.overallScore,
    missingKeywords: analysis.missingKeywords,
  });
}

/**
 * Track resume generation
 */
export function trackResumeGeneration(success: boolean) {
  trackEvent("resume_generation", { success });
}

