import Anthropic from "@anthropic-ai/sdk";
import { ResumeData, MatchAnalysis } from "@/types";
import { CLAUDE_MODEL } from "./claudeConfig";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Analyzes a job description against resume data to generate a match analysis
 * @param jobDescription - The job description text
 * @param resumeData - The parsed resume data
 * @returns MatchAnalysis object with detailed comparison results
 * @throws Error if Claude API call fails or returns invalid data
 */
export async function analyzeJobMatch(
  jobDescription: string,
  resumeData: ResumeData
): Promise<MatchAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Prepare resume data summary for Claude
  const resumeSummary = formatResumeForAnalysis(resumeData);

  const prompt = `You are a resume-job matching analyst. Your task is to analyze how well a candidate's resume matches a job description.

CRITICAL CONSTRAINT: You may ONLY reference skills, experience, and qualifications explicitly stated in the resume data provided below. Do NOT infer, extrapolate, or suggest the candidate has experience they don't have. Focus on reframing existing experience to highlight relevant aspects.

Your analysis must:
1. Extract required skills, qualifications, and keywords from the job description
2. Compare them against the candidate's actual resume data (ONLY what is explicitly stated)
3. Identify matches, gaps, and opportunities for truthful reframing
4. Generate bridging strategies that suggest how to highlight existing experience differently (NOT suggesting new experience)

Return your analysis as a JSON object with this exact structure:
{
  "matchedSkills": ["string array of skills from resume that match JD requirements"],
  "missingKeywords": ["string array of important keywords/requirements from JD that are NOT in the resume"],
  "experienceAlignment": {
    "strongMatches": ["string array of job requirements that strongly align with explicit resume experience"],
    "partialMatches": ["string array of job requirements that partially align with resume experience (can be reframed)"],
    "gaps": ["string array of job requirements that have no match in the resume"]
  },
  "overallScore": number (0-100, calculated based on matches),
  "bridgingStrategies": ["string array of truthful suggestions for how to reframe existing resume experience to better match JD requirements. Each strategy must reference ONLY what's in the resume."]
}

RULES FOR BRIDGING STRATEGIES:
- Only suggest reframing existing experience, never suggest new experience
- Example: "Highlight your experience with [specific technology from resume] as it relates to [JD requirement]"
- Example: "Emphasize your work on [specific project from resume] which demonstrates [JD skill]"
- NEVER say: "Consider gaining experience in..." or "You should have..."
- Focus on: "Your experience with X demonstrates Y" or "Reframe your work at [Company] to emphasize [relevant aspect]"

Job Description:
${jobDescription}

Resume Data:
${resumeSummary}`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const responseText =
      message.content[0].type === "text"
        ? message.content[0].text
        : "";

    if (!responseText) {
      throw new Error("Empty response from Claude API");
    }

    // Clean the response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // Parse JSON
    const analysis = JSON.parse(jsonText) as MatchAnalysis;

    // Validate the structure
    validateMatchAnalysis(analysis);

    return analysis;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse Claude API response as JSON: ${error.message}`
      );
    }
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Unknown error while analyzing job match");
  }
}

/**
 * Formats resume data into a structured string for Claude analysis
 * @param resumeData - The resume data to format
 * @returns Formatted string representation
 */
function formatResumeForAnalysis(resumeData: ResumeData): string {
  const parts: string[] = [];

  // Personal Info
  parts.push("PERSONAL INFORMATION:");
  parts.push(`Name: ${resumeData.personalInfo.name}`);
  parts.push(`Email: ${resumeData.personalInfo.email}`);
  if (resumeData.personalInfo.phone) {
    parts.push(`Phone: ${resumeData.personalInfo.phone}`);
  }
  if (resumeData.personalInfo.location) {
    parts.push(`Location: ${resumeData.personalInfo.location}`);
  }
  if (resumeData.personalInfo.linkedIn) {
    parts.push(`LinkedIn: ${resumeData.personalInfo.linkedIn}`);
  }
  parts.push("");

  // Summary
  if (resumeData.summary) {
    parts.push("SUMMARY:");
    parts.push(resumeData.summary);
    parts.push("");
  }

  // Work Experience
  parts.push("WORK EXPERIENCE:");
  resumeData.workExperience.forEach((exp, index) => {
    parts.push(`${index + 1}. ${exp.title} at ${exp.company}`);
    parts.push(`   Period: ${exp.startDate} - ${exp.endDate}`);
    parts.push(`   Responsibilities:`);
    exp.bullets.forEach((bullet) => {
      parts.push(`   - ${bullet}`);
    });
    parts.push("");
  });

  // Education
  parts.push("EDUCATION:");
  resumeData.education.forEach((edu) => {
    parts.push(
      `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`
    );
  });
  parts.push("");

  // Skills
  parts.push("SKILLS:");
  parts.push(resumeData.skills.join(", "));
  parts.push("");

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    parts.push("CERTIFICATIONS:");
    resumeData.certifications.forEach((cert) => {
      parts.push(`- ${cert}`);
    });
    parts.push("");
  }

  return parts.join("\n");
}

/**
 * Validates that the analysis matches the MatchAnalysis interface
 * @param analysis - Data to validate
 * @throws Error if data structure is invalid
 */
function validateMatchAnalysis(data: any): asserts data is MatchAnalysis {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid match analysis: not an object");
  }

  if (!Array.isArray(data.matchedSkills)) {
    throw new Error("Invalid match analysis: matchedSkills must be an array");
  }

  if (!Array.isArray(data.missingKeywords)) {
    throw new Error("Invalid match analysis: missingKeywords must be an array");
  }

  if (!data.experienceAlignment || typeof data.experienceAlignment !== "object") {
    throw new Error("Invalid match analysis: missing experienceAlignment");
  }

  if (!Array.isArray(data.experienceAlignment.strongMatches)) {
    throw new Error(
      "Invalid match analysis: experienceAlignment.strongMatches must be an array"
    );
  }

  if (!Array.isArray(data.experienceAlignment.partialMatches)) {
    throw new Error(
      "Invalid match analysis: experienceAlignment.partialMatches must be an array"
    );
  }

  if (!Array.isArray(data.experienceAlignment.gaps)) {
    throw new Error(
      "Invalid match analysis: experienceAlignment.gaps must be an array"
    );
  }

  if (
    typeof data.overallScore !== "number" ||
    data.overallScore < 0 ||
    data.overallScore > 100
  ) {
    throw new Error(
      "Invalid match analysis: overallScore must be a number between 0 and 100"
    );
  }

  if (!Array.isArray(data.bridgingStrategies)) {
    throw new Error(
      "Invalid match analysis: bridgingStrategies must be an array"
    );
  }
}

