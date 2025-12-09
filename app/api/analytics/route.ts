import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const summary = getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error getting analytics:", error);
    return NextResponse.json(
      {
        error: "Failed to get analytics",
      },
      { status: 500 }
    );
  }
}

