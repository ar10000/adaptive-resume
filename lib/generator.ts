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
- Do NOT invent or infer skills (e.g., if TensorFlow is listed, do NOT add PyTorch)
- Do NOT add similar or related technologies that aren't explicitly listed
- Group related skills if helpful
- Use ONLY the exact skills from the original resume

For work experience:
- Reorder positions if more relevant ones should appear first
- Rewrite job titles ONLY if the original title is very similar (e.g., "Software Engineer" -> "Senior Software Engineer" is NOT allowed unless explicitly stated)
- Keep all original dates and companies exactly as provided
- ALWAYS include all required fields: company, title, startDate, endDate, and bullets array
- If you need to rewrite a title, still include it - never omit required fields

Return JSON matching the ResumeData structure with rewritten content. The JSON must be valid and complete.

CRITICAL: You MUST include ALL required top-level fields in your response:
- personalInfo: object with name, email, and all other fields from the original resume
- workExperience: array (even if empty) - MUST include ALL work experience entries from the original resume
- education: array (even if empty) - MUST include ALL education entries from the original resume
- skills: array (even if empty)
- summary: string (if present in original, optional otherwise)
- certifications: array (if present in original, optional otherwise)

Do NOT omit any top-level fields. If you're unsure about a field, include it with the original value.

VERY IMPORTANT: You MUST include ALL work experience entries and ALL education entries from the original resume. Do NOT skip or omit any entries, even if the response is getting long. The response must be complete.

Original Resume Data:
${originalResumeText}

EXACT SKILLS LIST (You MUST use ONLY these skills - do NOT add any others):
${originalResumeData.skills.join(", ")}

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
      max_tokens: 8192, // Increased from 4096 to handle longer resumes
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Check if response was truncated
    if (message.stop_reason === "max_tokens") {
      throw new Error(
        "Response was truncated due to token limit. Your resume may be too long. " +
        "Please try with a shorter resume or contact support."
      );
    }

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

    // Check if JSON appears incomplete (common sign of truncation)
    if (!jsonText.trim().endsWith("}") && !jsonText.trim().endsWith("]")) {
      // Try to detect if it's a truncated JSON
      const openBraces = (jsonText.match(/{/g) || []).length;
      const closeBraces = (jsonText.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        throw new Error(
          "Response appears to be truncated. The generated resume JSON is incomplete. " +
          "This may happen with very long resumes. Please try again or contact support."
        );
      }
    }

    // Parse JSON
    let tailoredResume: ResumeData;
    try {
      tailoredResume = JSON.parse(jsonText) as ResumeData;
    } catch (parseError) {
      // Check if it's a JSON parsing error that might indicate truncation
      if (parseError instanceof SyntaxError) {
        throw new Error(
          `Failed to parse response as JSON. The response may have been truncated. ` +
          `Error: ${parseError.message}. Please try again with a shorter resume or contact support.`
        );
      }
      throw parseError;
    }

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
  parts.push("CRITICAL: The skills list above is EXACT. You MUST use ONLY these skills. Do NOT add, remove, or invent any skills.");
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

  // Ensure personalInfo exists and fill from original if missing
  if (!tailoredResume.personalInfo || typeof tailoredResume.personalInfo !== "object") {
    // If personalInfo is completely missing, copy from original
    tailoredResume.personalInfo = { ...originalResumeData.personalInfo };
  }

  // Fill in missing personalInfo fields from original
  if (!tailoredResume.personalInfo.name || typeof tailoredResume.personalInfo.name !== "string") {
    tailoredResume.personalInfo.name = originalResumeData.personalInfo.name;
  }
  if (!tailoredResume.personalInfo.email || typeof tailoredResume.personalInfo.email !== "string") {
    tailoredResume.personalInfo.email = originalResumeData.personalInfo.email;
  }
  if (!tailoredResume.personalInfo.phone && originalResumeData.personalInfo.phone) {
    tailoredResume.personalInfo.phone = originalResumeData.personalInfo.phone;
  }
  if (!tailoredResume.personalInfo.location && originalResumeData.personalInfo.location) {
    tailoredResume.personalInfo.location = originalResumeData.personalInfo.location;
  }
  if (!tailoredResume.personalInfo.linkedIn && originalResumeData.personalInfo.linkedIn) {
    tailoredResume.personalInfo.linkedIn = originalResumeData.personalInfo.linkedIn;
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

  // Validate each work experience entry - fill in missing fields from original
  tailoredResume.workExperience.forEach((exp: any, index: number) => {
    // Find matching original experience
    const originalExp = originalResumeData.workExperience.find(
      (e) => e.company === exp.company && e.startDate === exp.startDate
    ) || originalResumeData.workExperience.find(
      (e) => e.company === exp.company
    );

    if (!originalExp) {
      throw new Error(
        `Validation failed: Work experience at ${exp.company} not found in original resume`
      );
    }

    // Fill in missing fields from original (but allow title to be rewritten)
    if (!exp.company || typeof exp.company !== "string") {
      exp.company = originalExp.company;
    }
    if (!exp.title || typeof exp.title !== "string") {
      // Title can be missing, use original as fallback
      exp.title = originalExp.title;
    }
    if (!exp.startDate || typeof exp.startDate !== "string") {
      exp.startDate = originalExp.startDate;
    }
    if (!exp.endDate || typeof exp.endDate !== "string") {
      exp.endDate = originalExp.endDate;
    }
    if (!Array.isArray(exp.bullets)) {
      // If bullets are missing, use original bullets
      exp.bullets = originalExp.bullets;
    }

    // Validate dates match original (dates should be identical)
    if (exp.startDate !== originalExp.startDate) {
      throw new Error(`Validation failed: Start date for ${exp.company} cannot be changed`);
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
    // Find matching original education
    const originalEdu = originalResumeData.education.find(
      (e) => e.institution === edu.institution
    ) || originalResumeData.education[index];

    if (!edu.institution || typeof edu.institution !== "string") {
      if (originalEdu) {
        edu.institution = originalEdu.institution;
      } else {
        throw new Error(`Invalid tailored resume: education[${index}] missing institution`);
      }
    }
    if (!edu.degree || typeof edu.degree !== "string") {
      // Fill from original if available
      if (originalEdu) {
        edu.degree = originalEdu.degree;
      } else {
        edu.degree = "Degree";
      }
    }
    if (!edu.field || typeof edu.field !== "string") {
      // Fill from original if available
      if (originalEdu) {
        edu.field = originalEdu.field;
      } else {
        edu.field = "General Studies";
      }
    }
    if (!edu.graduationDate || typeof edu.graduationDate !== "string") {
      // Fill from original if available
      if (originalEdu) {
        edu.graduationDate = originalEdu.graduationDate;
      } else {
        edu.graduationDate = "N/A";
      }
    }
  });

  // Validate skills - check that all skills in tailored resume exist in original
  // Use flexible matching to handle variations (plural/singular, case, dash characters, etc.)
  if (!Array.isArray(tailoredResume.skills)) {
    // If skills array is missing or invalid, use original skills as fallback
    tailoredResume.skills = [...originalResumeData.skills];
  }

  // Normalize skills for comparison (handle variations)
  const normalizeSkill = (skill: string): string => {
    return skill
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ") // Normalize whitespace
      // Normalize different dash/hyphen characters to regular hyphen
      .replace(/[\u2010-\u2015\u2212\u002D\u00AD]/g, "-") // Various dashes/hyphens to regular hyphen
      .replace(/s$/, "") // Remove trailing 's' for plural handling
      .replace(/api$/, "api") // Normalize API variations
      .replace(/apis$/, "api");
  };

  const originalSkillsNormalized = originalResumeData.skills.map((s) => normalizeSkill(s));
  
  // Collect invalid skills to remove
  const invalidSkills: string[] = [];
  
  tailoredResume.skills.forEach((skill: string) => {
    const skillNormalized = normalizeSkill(skill);
    
    // Check exact match first
    if (originalSkillsNormalized.includes(skillNormalized)) {
      return;
    }
    
    // Check if it's a variation (contains or is contained by an original skill)
    const isVariation = originalResumeData.skills.some((originalSkill) => {
      const origNormalized = normalizeSkill(originalSkill);
      
      // Exact match after normalization
      if (skillNormalized === origNormalized) {
        return true;
      }
      
      // Check if one contains the other (handles "REST API" vs "REST APIs")
      if (
        skillNormalized.includes(origNormalized) ||
        origNormalized.includes(skillNormalized)
      ) {
        return true;
      }
      
      // Handle cases like "Scikit-Learn" vs "Scikit‑Learn" (different dash characters)
      // Remove all dashes and compare
      const skillNoDashes = skillNormalized.replace(/-/g, "");
      const origNoDashes = origNormalized.replace(/-/g, "");
      if (skillNoDashes === origNoDashes && skillNoDashes.length > 0) {
        return true;
      }
      
      return false;
    });

    if (!isVariation) {
      invalidSkills.push(skill);
    }
  });
  
  // Remove invalid skills and log warnings
  if (invalidSkills.length > 0) {
    invalidSkills.forEach((skill) => {
      console.warn(
        `Warning: Skill "${skill}" not found in original resume and will be removed. ` +
        `Original skills: ${originalResumeData.skills.join(", ")}.`
      );
    });
    // Filter out invalid skills
    tailoredResume.skills = tailoredResume.skills.filter(
      (skill: string) => !invalidSkills.includes(skill)
    );
    
    // If all skills were filtered out, restore original skills as fallback
    if (tailoredResume.skills.length === 0) {
      console.warn(
        "All skills were invalid. Restoring original skills list as fallback."
      );
      tailoredResume.skills = [...originalResumeData.skills];
    }
  }

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

