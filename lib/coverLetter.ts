import Anthropic from "@anthropic-ai/sdk";
import { ResumeData } from "@/types";
import { CLAUDE_MODEL } from "./claudeConfig";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Generates a professional cover letter based on resume data and job description
 * @param resumeData - The candidate's resume data
 * @param jobDescription - The job description text
 * @returns Generated cover letter text
 * @throws Error if Claude API call fails
 */
export async function generateCoverLetter(
  resumeData: ResumeData,
  jobDescription: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Format resume data for the prompt
  const resumeSummary = formatResumeForCoverLetter(resumeData);

  const prompt = `Based on the candidate's actual work experience and the job description, write a professional cover letter that:

- References specific projects/achievements from their resume
- Explains why their background is relevant
- Uses a confident but authentic tone
- Is 3-4 paragraphs
- Does NOT claim skills or experience not in the resume

CRITICAL CONSTRAINTS:
1. Only reference information explicitly stated in the resume data
2. Do NOT invent or infer projects, achievements, or experiences
3. Use specific examples from their work experience when available
4. Match the tone to the job level and industry
5. Keep it professional but personable
6. Focus on alignment between their experience and job requirements

Resume data:
${resumeSummary}

Job description:
${jobDescription}

Generate the cover letter now. Return only the cover letter text, no additional commentary or formatting.`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const coverLetterText =
      message.content[0].type === "text"
        ? message.content[0].text
        : "";

    if (!coverLetterText) {
      throw new Error("Empty response from Claude API");
    }

    // Clean the response (remove any markdown formatting if present)
    let cleanedText = coverLetterText.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```[\w]*\s*/, "").replace(/\s*```$/, "");
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Unknown error while generating cover letter");
  }
}

/**
 * Formats resume data into a structured string for cover letter generation
 * @param resumeData - The resume data to format
 * @returns Formatted string representation
 */
function formatResumeForCoverLetter(resumeData: ResumeData): string {
  const parts: string[] = [];

  // Personal Info
  parts.push("CANDIDATE INFORMATION:");
  parts.push(`Name: ${resumeData.personalInfo.name}`);
  parts.push(`Email: ${resumeData.personalInfo.email}`);
  if (resumeData.personalInfo.location) {
    parts.push(`Location: ${resumeData.personalInfo.location}`);
  }
  parts.push("");

  // Summary
  if (resumeData.summary) {
    parts.push("PROFESSIONAL SUMMARY:");
    parts.push(resumeData.summary);
    parts.push("");
  }

  // Work Experience (most important for cover letter)
  parts.push("WORK EXPERIENCE:");
  resumeData.workExperience.forEach((exp, index) => {
    parts.push(`${index + 1}. ${exp.title} at ${exp.company}`);
    parts.push(`   Period: ${exp.startDate} - ${exp.endDate}`);
    parts.push(`   Key Responsibilities and Achievements:`);
    exp.bullets.forEach((bullet) => {
      // Remove [LESS_RELEVANT] marker for cover letter context
      const cleanBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
      if (cleanBullet) {
        parts.push(`   - ${cleanBullet}`);
      }
    });
    parts.push("");
  });

  // Education
  if (resumeData.education.length > 0) {
    parts.push("EDUCATION:");
    resumeData.education.forEach((edu) => {
      parts.push(
        `${edu.degree} in ${edu.field} from ${edu.institution} (${edu.graduationDate})`
      );
    });
    parts.push("");
  }

  // Skills
  if (resumeData.skills.length > 0) {
    parts.push("SKILLS:");
    parts.push(resumeData.skills.join(", "));
    parts.push("");
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    parts.push("CERTIFICATIONS:");
    resumeData.certifications.forEach((cert) => {
      parts.push(`- ${cert}`);
    });
  }

  return parts.join("\n");
}

