import { NextRequest, NextResponse } from "next/server";
import { generateTailoredResume } from "@/lib/generator";
import { ResumeData, MatchAnalysis } from "@/types";
import { checkRateLimit } from "@/lib/rateLimit";
import { trackResumeGeneration } from "@/lib/analytics";

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
    const { originalResumeData, jobDescription, matchAnalysis } = body;

    if (!originalResumeData || !jobDescription || !matchAnalysis) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate tailored resume
    try {
      const tailoredResume = await generateTailoredResume(
        originalResumeData as ResumeData,
        jobDescription,
        matchAnalysis as MatchAnalysis
      );

      // Track successful generation
      trackResumeGeneration(true);

      return NextResponse.json({ tailoredResume });
    } catch (error) {
      // Track failed generation
      trackResumeGeneration(false);
      throw error;
    }
  } catch (error) {
    console.error("Error generating tailored resume:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate tailored resume",
      },
      { status: 500 }
    );
  }
}

