import pdfParse from "pdf-parse";
import Anthropic from "@anthropic-ai/sdk";
import { ResumeData } from "@/types";
import { CLAUDE_MODEL } from "./claudeConfig";

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

/**
 * Extracts text content from a PDF file
 * @param file - PDF file (File object or Buffer)
 * @returns Extracted text content
 * @throws Error if PDF is malformed or cannot be parsed
 */
async function extractTextFromPDF(
  file: File | Buffer
): Promise<string> {
  try {
    let buffer: Buffer;

    if (file instanceof File) {
      // Convert File to ArrayBuffer, then to Buffer
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    // Parse PDF and extract text
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
    throw new Error("Failed to parse PDF: Unknown error");
  }
}

/**
 * Structures extracted text into ResumeData using Claude API
 * @param text - Raw text extracted from PDF
 * @returns Structured ResumeData object
 * @throws Error if Claude API call fails or returns invalid JSON
 */
async function structureResumeData(text: string): Promise<ResumeData> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const prompt = `You are a resume parser. Extract ONLY the facts that are explicitly present in the following text from a PDF (LinkedIn profile or CV). Do NOT infer, add, or assume any information that is not directly stated.

Extract and structure the data into this exact JSON format:
{
  "personalInfo": {
    "name": "string (full name as written)",
    "email": "string (email address if present)",
    "phone": "string (phone number if present, optional)",
    "location": "string (location if present, optional)",
    "linkedIn": "string (LinkedIn URL if present, optional)"
  },
  "summary": "string (professional summary if present, optional)",
  "workExperience": [
    {
      "company": "string (company name)",
      "title": "string (job title)",
      "startDate": "string (format: YYYY-MM or YYYY, use the format found in the document)",
      "endDate": "string (format: YYYY-MM or YYYY, use 'Present' if current, use the format found in the document)",
      "bullets": ["string (bullet points describing responsibilities/achievements)"]
    }
  ],
  "education": [
    {
      "institution": "string (school/university name)",
      "degree": "string (degree type, e.g., 'Bachelor of Science', 'Master of Arts')",
      "field": "string (field of study, e.g., 'Computer Science', 'Business Administration')",
      "graduationDate": "string (format: YYYY-MM or YYYY, use the format found in the document)"
    }
  ],
  "skills": ["string (list of skills mentioned)"],
  "certifications": ["string (certification names if present, optional)"]
}

CRITICAL RULES:
1. Extract ONLY information explicitly stated in the text
2. Do NOT infer dates, companies, or any other information
3. If information is not present, use null for optional fields or empty arrays
4. Keep dates in the same format as they appear in the document (YYYY-MM, YYYY, or month/year format)
5. For endDate in workExperience, use "Present" if the position is current
6. Return ONLY valid JSON, no markdown, no code blocks, no explanations
7. Ensure all dates are consistently formatted within the same field type

Text to parse:
${text}`;

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
    const parsedData = JSON.parse(jsonText) as ResumeData;

    // Validate the structure
    validateResumeData(parsedData);

    return parsedData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse Claude API response as JSON: ${error.message}`
      );
    }
    if (error instanceof Error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw new Error("Unknown error while structuring resume data");
  }
}

/**
 * Validates that the parsed data matches the ResumeData interface
 * @param data - Data to validate
 * @throws Error if data structure is invalid
 */
function validateResumeData(data: any): asserts data is ResumeData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid resume data: not an object");
  }

  if (!data.personalInfo || typeof data.personalInfo !== "object") {
    throw new Error("Invalid resume data: missing personalInfo");
  }

  if (!data.personalInfo.name || typeof data.personalInfo.name !== "string") {
    throw new Error("Invalid resume data: missing or invalid name");
  }

  if (!data.personalInfo.email || typeof data.personalInfo.email !== "string") {
    throw new Error("Invalid resume data: missing or invalid email");
  }

  if (!Array.isArray(data.workExperience)) {
    throw new Error("Invalid resume data: workExperience must be an array");
  }

  if (!Array.isArray(data.education)) {
    throw new Error("Invalid resume data: education must be an array");
  }

  if (!Array.isArray(data.skills)) {
    throw new Error("Invalid resume data: skills must be an array");
  }

  // Validate work experience entries
  data.workExperience.forEach((exp: any, index: number) => {
    if (!exp.company || typeof exp.company !== "string") {
      throw new Error(
        `Invalid resume data: workExperience[${index}] missing company`
      );
    }
    if (!exp.title || typeof exp.title !== "string") {
      throw new Error(`Invalid resume data: workExperience[${index}] missing title`);
    }
    if (!exp.startDate || typeof exp.startDate !== "string") {
      throw new Error(
        `Invalid resume data: workExperience[${index}] missing startDate`
      );
    }
    if (!exp.endDate || typeof exp.endDate !== "string") {
      throw new Error(
        `Invalid resume data: workExperience[${index}] missing endDate`
      );
    }
    if (!Array.isArray(exp.bullets)) {
      throw new Error(
        `Invalid resume data: workExperience[${index}] bullets must be an array`
      );
    }
  });

  // Validate education entries
  data.education.forEach((edu: any, index: number) => {
    if (!edu.institution || typeof edu.institution !== "string") {
      throw new Error(
        `Invalid resume data: education[${index}] missing institution`
      );
    }
    if (!edu.degree || typeof edu.degree !== "string") {
      throw new Error(`Invalid resume data: education[${index}] missing degree`);
    }
    if (!edu.field || typeof edu.field !== "string") {
      throw new Error(`Invalid resume data: education[${index}] missing field`);
    }
    if (!edu.graduationDate || typeof edu.graduationDate !== "string") {
      throw new Error(
        `Invalid resume data: education[${index}] missing graduationDate`
      );
    }
  });
}

/**
 * Main function to parse a PDF file and extract structured resume data
 * @param file - PDF file (File object or Buffer)
 * @returns Structured ResumeData object
 * @throws Error if PDF parsing or structuring fails
 */
export async function parsePDFToResumeData(
  file: File | Buffer
): Promise<ResumeData> {
  try {
    // Step 1: Extract text from PDF
    const text = await extractTextFromPDF(file);

    if (!text || text.trim().length === 0) {
      throw new Error("PDF appears to be empty or contains no extractable text");
    }

    // Step 2: Structure the data using Claude
    const structuredData = await structureResumeData(text);

    return structuredData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error while parsing PDF");
  }
}

// Export helper functions for testing or direct use
export { extractTextFromPDF, structureResumeData };

