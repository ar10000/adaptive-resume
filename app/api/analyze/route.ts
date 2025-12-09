import { NextRequest, NextResponse } from "next/server";
import { analyzeJobMatch } from "@/lib/analyzer";
import { ResumeData } from "@/types";
import { checkRateLimit } from "@/lib/rateLimit";
import { trackMatchAnalysis } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please try again later.",
        resetTime: rateLimit.resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        },
      }
    );
  }
  try {
    const body = await request.json();
    const { jobDescription, resumeData } = body;

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    // Analyze the match
    const matchAnalysis = await analyzeJobMatch(
      jobDescription,
      resumeData as ResumeData
    );

    // Track analytics
    trackMatchAnalysis({
      overallScore: matchAnalysis.overallScore,
      missingKeywords: matchAnalysis.missingKeywords,
    });

    return NextResponse.json({ matchAnalysis });
  } catch (error) {
    console.error("Error analyzing job match:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze job match",
      },
      { status: 500 }
    );
  }
}

