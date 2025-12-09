import { NextRequest, NextResponse } from "next/server";
import { parsePDFToResumeData } from "@/lib/parser";
import { checkRateLimit } from "@/lib/rateLimit";

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
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Parse the PDF
    const resumeData = await parsePDFToResumeData(file);

    return NextResponse.json({ resumeData });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to parse PDF",
      },
      { status: 500 }
    );
  }
}

