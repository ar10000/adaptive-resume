import { NextRequest, NextResponse } from "next/server";
import { exportResumeToPDF } from "@/lib/exportPDF";
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

    // Generate PDF
    const pdfBlob = exportResumeToPDF(resumeData as ResumeData);

    // Convert blob to buffer for response
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return PDF as response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to export PDF",
      },
      { status: 500 }
    );
  }
}

