import { NextRequest, NextResponse } from "next/server";
import { generateInterviewPrep } from "@/lib/interviewPrep";
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

    // Generate interview prep document
    const interviewPrep = await generateInterviewPrep(
      resumeData as ResumeData,
      jobDescription
    );

    return NextResponse.json({ interviewPrep });
  } catch (error) {
    console.error("Error generating interview prep:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate interview prep document",
      },
      { status: 500 }
    );
  }
}

