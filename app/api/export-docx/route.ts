import { NextRequest, NextResponse } from "next/server";
import { exportResumeToDOCX } from "@/lib/exportDOCX";
import { ResumeData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    // Generate DOCX
    const docxBlob = await exportResumeToDOCX(resumeData as ResumeData);

    // Convert blob to buffer for response
    const arrayBuffer = await docxBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return DOCX as response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="resume.docx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting DOCX:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to export DOCX",
      },
      { status: 500 }
    );
  }
}

