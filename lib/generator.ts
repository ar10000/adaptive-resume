import Anthropic from "@anthropic-ai/sdk";
import { ResumeData, MatchAnalysis } from "@/types";
import { CLAUDE_MODEL } from "./claudeConfig";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Generates a tailored resume optimized for a specific job description
 * @param originalResumeData - The original parsed resume data
 * @param jobDescription - The target job description text
 * @param matchAnalysis - The match analysis from analyzeJobMatch
 * @returns Optimized ResumeData tailored to the job description
 * @throws Error if Claude API call fails or returns invalid data
 */
export async function generateTailoredResume(
  originalResumeData: ResumeData,
  jobDescription: string,
  matchAnalysis: MatchAnalysis
): Promise<ResumeData> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  // Format the original resume data for Claude
  const originalResumeText = formatResumeForGeneration(originalResumeData);

  const prompt = `You are a resume rewriting assistant with ABSOLUTE TRUTH CONSTRAINTS.

Rules you MUST follow:
1. You can ONLY use information from the provided resume data
2. You CANNOT add skills, technologies, or experiences not explicitly listed
3. You CANNOT invent metrics, numbers, or achievements
4. You CAN rephrase bullets to emphasize relevance to the job description
5. You CAN reorder information for better alignment
6. You CAN adjust language/tone while maintaining factual accuracy

For each work experience bullet:
- Rewrite to highlight aspects relevant to the target role
- Use keywords from the JD naturally
- Maintain the core truth of the original bullet
- If a bullet isn't relevant, mark it as [LESS_RELEVANT] but never delete

For the summary:
- Rewrite to emphasize alignment with the job description
- Use only facts from the original resume
- Incorporate relevant keywords naturally

For skills:
- Reorder to prioritize skills mentioned in the job description
- Do NOT add skills not in the original list
- Group related skills if helpful

For work experience:
- Reorder positions if more relevant ones should appear first
- Rewrite job titles ONLY if the original title is very similar (e.g., "Software Engineer" -> "Senior Software Engineer" is NOT allowed unless explicitly stated)
- Keep all original dates and companies exactly as provided

Return JSON matching the ResumeData structure with rewritten content. The JSON must be valid and complete.

Original Resume Data:
${originalResumeText}

Target Job Description:
${jobDescription}

Match Analysis (for reference):
- Matched Skills: ${matchAnalysis.matchedSkills.join(", ")}
- Missing Keywords: ${matchAnalysis.missingKeywords.join(", ")}
- Strong Matches: ${matchAnalysis.experienceAlignment.strongMatches.join(", ")}
- Partial Matches: ${matchAnalysis.experienceAlignment.partialMatches.join(", ")}
- Bridging Strategies: ${matchAnalysis.bridgingStrategies.join("; ")}

Remember: You can ONLY work with what's in the original resume. Never add, invent, or fabricate anything.`;

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
    const tailoredResume = JSON.parse(jsonText) as ResumeData;

    // Validate the structure and ensure no fabrication
    validateTailoredResume(tailoredResume, originalResumeData);

    return tailoredResume;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse Claude API response as JSON: ${error.message}`
      );
    }
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Unknown error while generating tailored resume");
  }
}

/**
 * Formats resume data into a structured string for Claude generation
 * @param resumeData - The resume data to format
 * @returns Formatted string representation
 */
function formatResumeForGeneration(resumeData: ResumeData): string {
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
 * Validates that the tailored resume is truthful and doesn't fabricate information
 * @param tailoredResume - The generated tailored resume
 * @param originalResumeData - The original resume data for comparison
 * @throws Error if validation fails (fabrication detected or structure invalid)
 */
function validateTailoredResume(
  tailoredResume: any,
  originalResumeData: ResumeData
): asserts tailoredResume is ResumeData {
  // Validate structure matches ResumeData interface
  if (!tailoredResume || typeof tailoredResume !== "object") {
    throw new Error("Invalid tailored resume: not an object");
  }

  if (!tailoredResume.personalInfo || typeof tailoredResume.personalInfo !== "object") {
    throw new Error("Invalid tailored resume: missing personalInfo");
  }

  if (!tailoredResume.personalInfo.name || typeof tailoredResume.personalInfo.name !== "string") {
    throw new Error("Invalid tailored resume: missing or invalid name");
  }

  if (!tailoredResume.personalInfo.email || typeof tailoredResume.personalInfo.email !== "string") {
    throw new Error("Invalid tailored resume: missing or invalid email");
  }

  // Validate personal info matches (should be identical)
  if (tailoredResume.personalInfo.name !== originalResumeData.personalInfo.name) {
    throw new Error("Validation failed: Name cannot be changed");
  }
  if (tailoredResume.personalInfo.email !== originalResumeData.personalInfo.email) {
    throw new Error("Validation failed: Email cannot be changed");
  }

  // Validate work experience structure
  if (!Array.isArray(tailoredResume.workExperience)) {
    throw new Error("Invalid tailored resume: workExperience must be an array");
  }

  // Check that we have the same number of work experiences (or fewer if some were marked as less relevant)
  if (tailoredResume.workExperience.length > originalResumeData.workExperience.length) {
    throw new Error("Validation failed: Cannot add work experiences not in original resume");
  }

  // Validate each work experience entry
  tailoredResume.workExperience.forEach((exp: any, index: number) => {
    if (!exp.company || typeof exp.company !== "string") {
      throw new Error(`Invalid tailored resume: workExperience[${index}] missing company`);
    }
    if (!exp.title || typeof exp.title !== "string") {
      throw new Error(`Invalid tailored resume: workExperience[${index}] missing title`);
    }
    if (!exp.startDate || typeof exp.startDate !== "string") {
      throw new Error(`Invalid tailored resume: workExperience[${index}] missing startDate`);
    }
    if (!exp.endDate || typeof exp.endDate !== "string") {
      throw new Error(`Invalid tailored resume: workExperience[${index}] missing endDate`);
    }
    if (!Array.isArray(exp.bullets)) {
      throw new Error(`Invalid tailored resume: workExperience[${index}] bullets must be an array`);
    }

    // Check that company and dates match original (dates should be identical)
    const originalExp = originalResumeData.workExperience.find(
      (e) => e.company === exp.company && e.startDate === exp.startDate
    );
    if (!originalExp) {
      throw new Error(
        `Validation failed: Work experience at ${exp.company} (${exp.startDate}) not found in original resume`
      );
    }
    if (exp.endDate !== originalExp.endDate) {
      throw new Error(`Validation failed: End date for ${exp.company} cannot be changed`);
    }
  });

  // Validate education structure
  if (!Array.isArray(tailoredResume.education)) {
    throw new Error("Invalid tailored resume: education must be an array");
  }

  if (tailoredResume.education.length > originalResumeData.education.length) {
    throw new Error("Validation failed: Cannot add education not in original resume");
  }

  tailoredResume.education.forEach((edu: any, index: number) => {
    if (!edu.institution || typeof edu.institution !== "string") {
      throw new Error(`Invalid tailored resume: education[${index}] missing institution`);
    }
    if (!edu.degree || typeof edu.degree !== "string") {
      throw new Error(`Invalid tailored resume: education[${index}] missing degree`);
    }
    if (!edu.field || typeof edu.field !== "string") {
      throw new Error(`Invalid tailored resume: education[${index}] missing field`);
    }
    if (!edu.graduationDate || typeof edu.graduationDate !== "string") {
      throw new Error(`Invalid tailored resume: education[${index}] missing graduationDate`);
    }
  });

  // Validate skills - check that all skills in tailored resume exist in original
  if (!Array.isArray(tailoredResume.skills)) {
    throw new Error("Invalid tailored resume: skills must be an array");
  }

  const originalSkillsLower = originalResumeData.skills.map((s) => s.toLowerCase().trim());
  tailoredResume.skills.forEach((skill: string) => {
    const skillLower = skill.toLowerCase().trim();
    if (!originalSkillsLower.includes(skillLower)) {
      throw new Error(
        `Validation failed: Skill "${skill}" not found in original resume. Cannot add new skills.`
      );
    }
  });

  // Validate certifications if present
  if (tailoredResume.certifications) {
    if (!Array.isArray(tailoredResume.certifications)) {
      throw new Error("Invalid tailored resume: certifications must be an array");
    }

    const originalCerts = originalResumeData.certifications || [];
    const originalCertsLower = originalCerts.map((c) => c.toLowerCase().trim());
    tailoredResume.certifications.forEach((cert: string) => {
      const certLower = cert.toLowerCase().trim();
      if (!originalCertsLower.includes(certLower)) {
        throw new Error(
          `Validation failed: Certification "${cert}" not found in original resume. Cannot add new certifications.`
        );
      }
    });
  }
}

