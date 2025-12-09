import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/coverLetter";
import { ResumeData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData, jobDescription } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      resumeData as ResumeData,
      jobDescription
    );

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover letter",
      },
      { status: 500 }
    );
  }
}

