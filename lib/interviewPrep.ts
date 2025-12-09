import Anthropic from "@anthropic-ai/sdk";
import { ResumeData } from "@/types";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Generates an interview preparation document based on resume data and job description
 * @param resumeData - The candidate's resume data
 * @param jobDescription - The job description text
 * @returns Generated interview prep document as markdown
 * @throws Error if Claude API call fails
 */
export async function generateInterviewPrep(
  resumeData: ResumeData,
  jobDescription: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Format resume data for the prompt
  const resumeSummary = formatResumeForInterviewPrep(resumeData);

  const prompt = `Create a comprehensive interview preparation document in markdown format. The document should help the candidate prepare for interviews for this specific role.

CRITICAL CONSTRAINTS:
1. ONLY reference information explicitly stated in the resume data
2. Do NOT invent or infer projects, achievements, or experiences
3. Use specific examples from their actual work experience
4. Base all answers on their real accomplishments
5. Use the STAR method (Situation, Task, Action, Result) with their actual projects

The document should include:

1. **Common Interview Questions for This Role**
   - 8-10 typical questions for this position/industry
   - Questions should be relevant to the job description

2. **Suggested Answers Based on Their Experience**
   - For each question, provide a suggested answer that references their actual resume experience
   - Use specific examples from their work history
   - Format answers clearly and professionally

3. **STAR Method Examples**
   - 3-4 detailed STAR examples using their real projects/achievements
   - Each should include:
     * Situation: Context from their actual experience
     * Task: What they needed to accomplish
     * Action: What they actually did (from resume)
     * Result: Outcomes/achievements (only if stated in resume)
   - Base these ONLY on information in the resume

4. **Questions to Ask the Interviewer**
   - 8-10 thoughtful questions about the role, team, company
   - Questions should demonstrate interest and help evaluate fit
   - Tailored to the job description

Format the entire response as clean markdown with proper headings, bullet points, and structure. Use markdown formatting for readability.

Resume data:
${resumeSummary}

Job description:
${jobDescription}

Generate the interview preparation document now. Return only the markdown document, no additional commentary.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const interviewPrepText =
      message.content[0].type === "text"
        ? message.content[0].text
        : "";

    if (!interviewPrepText) {
      throw new Error("Empty response from Claude API");
    }

    // Clean the response (remove any markdown code blocks if present)
    let cleanedText = interviewPrepText.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```markdown")) {
      cleanedText = cleanedText.replace(/^```markdown\s*/, "").replace(/\s*```$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Unknown error while generating interview prep document");
  }
}

/**
 * Formats resume data into a structured string for interview prep generation
 * @param resumeData - The resume data to format
 * @returns Formatted string representation
 */
function formatResumeForInterviewPrep(resumeData: ResumeData): string {
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

  // Work Experience (most important for interview prep)
  parts.push("WORK EXPERIENCE:");
  resumeData.workExperience.forEach((exp, index) => {
    parts.push(`${index + 1}. ${exp.title} at ${exp.company}`);
    parts.push(`   Period: ${exp.startDate} - ${exp.endDate}`);
    parts.push(`   Key Responsibilities and Achievements:`);
    exp.bullets.forEach((bullet) => {
      // Remove [LESS_RELEVANT] marker for interview prep context
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
    parts.push("");
  }

  return parts.join("\n");
}

/**
 * Converts markdown interview prep to a downloadable blob
 * @param markdown - The markdown content
 * @returns Blob containing the markdown file
 */
export function exportInterviewPrepToFile(markdown: string): Blob {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  return blob;
}

