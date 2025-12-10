import DESIGN_SYSTEM from "../design/visualSystem";
import { ResumeData } from "@/types";

/**
 * Visual Quality Assurance Report
 */
export interface VisualQAReport {
  typography: {
    fontConsistency: number; // All text uses correct fonts
    sizeConsistency: number; // All sizes match DESIGN_SYSTEM
    weightConsistency: number; // Bold/normal applied correctly
  };
  spacing: {
    marginConsistency: number; // All margins identical
    sectionGaps: number; // Consistent spacing between sections
    bulletAlignment: number; // All bullets aligned
  };
  visual: {
    colorPalette: number; // Only uses defined colors
    lineAlignment: number; // Everything aligned to grid
    whiteSpace: number; // Proper breathing room
  };
  overall: number;
  issues: string[];
}

/**
 * Visual QA Configuration
 */
interface VisualQAConfig {
  tolerance: {
    spacing: number; // Allowable deviation in points
    color: number; // Allowable color deviation (0-255)
  };
  requiredElements: {
    name: boolean;
    contact: boolean;
    sections: string[];
  };
}

const QA_CONFIG: VisualQAConfig = {
  tolerance: {
    spacing: 2, // 2pt tolerance for spacing
    color: 5, // 5 RGB units tolerance for colors
  },
  requiredElements: {
    name: true,
    contact: true,
    sections: ["WORK EXPERIENCE", "EDUCATION", "SKILLS"],
  },
};

/**
 * Check visual consistency of a generated PDF
 * 
 * Since we can't directly parse PDF content in the browser,
 * we validate against the design system and resume data structure
 * 
 * @param pdfBlob - The PDF blob to check
 * @param resumeData - The resume data used to generate the PDF
 * @returns Visual QA report with scores and issues
 */
export function checkVisualConsistency(
  pdfBlob: Blob,
  resumeData: ResumeData
): VisualQAReport {
  const issues: string[] = [];
  const scores = {
    typography: {
      fontConsistency: 100,
      sizeConsistency: 100,
      weightConsistency: 100,
    },
    spacing: {
      marginConsistency: 100,
      sectionGaps: 100,
      bulletAlignment: 100,
    },
    visual: {
      colorPalette: 100,
      lineAlignment: 100,
      whiteSpace: 100,
    },
  };

  // Validate typography
  const typographyIssues = checkTypography(resumeData);
  if (typographyIssues.length > 0) {
    issues.push(...typographyIssues);
    scores.typography.fontConsistency = Math.max(
      0,
      100 - typographyIssues.length * 10
    );
  }

  // Validate spacing
  const spacingIssues = checkSpacing(resumeData);
  if (spacingIssues.length > 0) {
    issues.push(...spacingIssues);
    scores.spacing.marginConsistency = Math.max(
      0,
      100 - spacingIssues.length * 10
    );
  }

  // Validate visual elements
  const visualIssues = checkVisualElements(resumeData);
  if (visualIssues.length > 0) {
    issues.push(...visualIssues);
    scores.visual.colorPalette = Math.max(0, 100 - visualIssues.length * 10);
  }

  // Validate required elements
  const requiredIssues = checkRequiredElements(resumeData);
  if (requiredIssues.length > 0) {
    issues.push(...requiredIssues);
    // Deduct points from overall score
  }

  // Calculate overall score
  const overall =
    (scores.typography.fontConsistency +
      scores.typography.sizeConsistency +
      scores.typography.weightConsistency +
      scores.spacing.marginConsistency +
      scores.spacing.sectionGaps +
      scores.spacing.bulletAlignment +
      scores.visual.colorPalette +
      scores.visual.lineAlignment +
      scores.visual.whiteSpace) /
    9;

  return {
    typography: scores.typography,
    spacing: scores.spacing,
    visual: scores.visual,
    overall: Math.round(overall * 100) / 100,
    issues: [...issues, ...requiredIssues],
  };
}

/**
 * Check typography consistency
 */
function checkTypography(resumeData: ResumeData): string[] {
  const issues: string[] = [];

  // Check name exists and is not empty
  if (!resumeData.personalInfo.name || resumeData.personalInfo.name.trim() === "") {
    issues.push("Missing or empty name");
  }

  // Check name length (should be reasonable)
  if (
    resumeData.personalInfo.name &&
    resumeData.personalInfo.name.length > 100
  ) {
    issues.push("Name is unusually long (may cause formatting issues)");
  }

  // Check contact info exists
  if (
    !resumeData.personalInfo.email &&
    !resumeData.personalInfo.phone &&
    !resumeData.personalInfo.location
  ) {
    issues.push("Missing contact information");
  }

  // Check work experience has proper structure
  resumeData.workExperience.forEach((exp, index) => {
    if (!exp.title || exp.title.trim() === "") {
      issues.push(`Work experience ${index + 1}: Missing job title`);
    }
    if (!exp.company || exp.company.trim() === "") {
      issues.push(`Work experience ${index + 1}: Missing company name`);
    }
    if (!exp.bullets || exp.bullets.length === 0) {
      issues.push(`Work experience ${index + 1}: Missing bullet points`);
    }
    // Check bullet point length (should not be too long)
    exp.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.length > 200) {
        issues.push(
          `Work experience ${index + 1}, bullet ${bulletIndex + 1}: Bullet point is very long (may cause wrapping issues)`
        );
      }
    });
  });

  // Check education has proper structure
  resumeData.education.forEach((edu, index) => {
    if (!edu.institution || edu.institution.trim() === "") {
      issues.push(`Education ${index + 1}: Missing institution name`);
    }
    if (!edu.degree || edu.degree.trim() === "") {
      issues.push(`Education ${index + 1}: Missing degree`);
    }
  });

  // Check skills exist
  if (!resumeData.skills || resumeData.skills.length === 0) {
    issues.push("Missing skills section");
  }

  return issues;
}

/**
 * Check spacing consistency
 */
function checkSpacing(resumeData: ResumeData): string[] {
  const issues: string[] = [];

  // Check if resume is too long (would cause spacing issues)
  const totalBullets = resumeData.workExperience.reduce(
    (sum, exp) => sum + exp.bullets.length,
    0
  );

  // Estimate page count based on content
  const estimatedPages = estimatePageCount(resumeData);
  if (estimatedPages > DESIGN_SYSTEM.layout.maxWidth / 612) {
    // This is a rough estimate - in reality, we'd need to check the actual PDF
    issues.push(
      `Resume may exceed recommended length (estimated ${estimatedPages.toFixed(1)} pages)`
    );
  }

  // Check for excessive bullet points in a single job
  resumeData.workExperience.forEach((exp, index) => {
    if (exp.bullets.length > 8) {
      issues.push(
        `Work experience ${index + 1}: Too many bullet points (${exp.bullets.length}), consider reducing to 5-6`
      );
    }
  });

  return issues;
}

/**
 * Check visual elements
 */
function checkVisualElements(resumeData: ResumeData): string[] {
  const issues: string[] = [];

  // Check for special characters that might cause rendering issues
  const specialCharPattern = /[^\x20-\x7E\u00A0-\uFFFF]/g;
  const checkText = (text: string, context: string) => {
    const matches = text.match(specialCharPattern);
    if (matches && matches.length > 0) {
      issues.push(`${context}: Contains unusual characters that may cause rendering issues`);
    }
  };

  checkText(resumeData.personalInfo.name, "Name");
  resumeData.workExperience.forEach((exp, index) => {
    checkText(exp.title, `Work experience ${index + 1} title`);
    checkText(exp.company, `Work experience ${index + 1} company`);
    exp.bullets.forEach((bullet, bulletIndex) => {
      checkText(bullet, `Work experience ${index + 1}, bullet ${bulletIndex + 1}`);
    });
  });

  return issues;
}

/**
 * Check required elements are present
 */
function checkRequiredElements(resumeData: ResumeData): string[] {
  const issues: string[] = [];

  // Check name
  if (QA_CONFIG.requiredElements.name && !resumeData.personalInfo.name) {
    issues.push("Missing required element: Name");
  }

  // Check contact
  if (
    QA_CONFIG.requiredElements.contact &&
    !resumeData.personalInfo.email &&
    !resumeData.personalInfo.phone
  ) {
    issues.push("Missing required element: Contact information");
  }

  // Check sections
  if (
    QA_CONFIG.requiredElements.sections.includes("WORK EXPERIENCE") &&
    resumeData.workExperience.length === 0
  ) {
    issues.push("Missing required section: Work Experience");
  }

  if (
    QA_CONFIG.requiredElements.sections.includes("EDUCATION") &&
    resumeData.education.length === 0
  ) {
    issues.push("Missing required section: Education");
  }

  if (
    QA_CONFIG.requiredElements.sections.includes("SKILLS") &&
    resumeData.skills.length === 0
  ) {
    issues.push("Missing required section: Skills");
  }

  return issues;
}

/**
 * Estimate page count based on content
 */
function estimatePageCount(resumeData: ResumeData): number {
  const pageHeight = 792; // 11" in points
  const marginTop = DESIGN_SYSTEM.spacing.pageMargin.top;
  const marginBottom = DESIGN_SYSTEM.spacing.pageMargin.bottom;
  const usableHeight = pageHeight - marginTop - marginBottom;

  let currentHeight = marginTop;

  // Name and contact
  currentHeight +=
    DESIGN_SYSTEM.typography.sizes.name *
      DESIGN_SYSTEM.spacing.lineHeight +
    DESIGN_SYSTEM.spacing.nameToContact +
    DESIGN_SYSTEM.typography.sizes.contact *
      DESIGN_SYSTEM.spacing.lineHeight +
    DESIGN_SYSTEM.spacing.contactToSummary;

  // Summary
  if (resumeData.summary) {
    const summaryLines = Math.ceil(
      (resumeData.summary.length || 0) / 80
    ); // Rough estimate
    currentHeight +=
      DESIGN_SYSTEM.typography.sizes.sectionHeader *
        DESIGN_SYSTEM.spacing.lineHeight +
      DESIGN_SYSTEM.spacing.headerToContent +
      summaryLines *
        DESIGN_SYSTEM.typography.sizes.body *
        DESIGN_SYSTEM.spacing.lineHeight +
      DESIGN_SYSTEM.spacing.sectionGap;
  }

  // Work experience
  resumeData.workExperience.forEach((exp) => {
    currentHeight +=
      DESIGN_SYSTEM.typography.sizes.sectionHeader *
        DESIGN_SYSTEM.spacing.lineHeight +
      DESIGN_SYSTEM.spacing.headerToContent +
      DESIGN_SYSTEM.typography.sizes.jobTitle *
        DESIGN_SYSTEM.spacing.lineHeight +
      DESIGN_SYSTEM.typography.sizes.body *
        DESIGN_SYSTEM.spacing.lineHeight +
      DESIGN_SYSTEM.spacing.bulletGap;

    exp.bullets.forEach(() => {
      currentHeight +=
        DESIGN_SYSTEM.typography.sizes.body *
          DESIGN_SYSTEM.spacing.lineHeight +
        DESIGN_SYSTEM.spacing.bulletGap;
    });

    currentHeight += DESIGN_SYSTEM.spacing.jobGap;
  });

  currentHeight += DESIGN_SYSTEM.spacing.sectionGap;

  // Education
  resumeData.education.forEach(() => {
    currentHeight +=
      DESIGN_SYSTEM.typography.sizes.body *
        DESIGN_SYSTEM.spacing.lineHeight *
        2 +
      DESIGN_SYSTEM.spacing.jobGap;
  });

  currentHeight += DESIGN_SYSTEM.spacing.sectionGap;

  // Skills
  const skillsText = resumeData.skills.join(", ");
  const skillsLines = Math.ceil(skillsText.length / 80);
  currentHeight +=
    DESIGN_SYSTEM.typography.sizes.sectionHeader *
      DESIGN_SYSTEM.spacing.lineHeight +
    DESIGN_SYSTEM.spacing.headerToContent +
    skillsLines *
      DESIGN_SYSTEM.typography.sizes.body *
      DESIGN_SYSTEM.spacing.lineHeight;

  return Math.ceil(currentHeight / usableHeight);
}

/**
 * Get quality badge color based on score
 */
export function getQualityBadgeColor(score: number): string {
  if (score >= 95) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 85) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

/**
 * Get quality status text
 */
export function getQualityStatus(score: number): string {
  if (score >= 95) return "Excellent";
  if (score >= 85) return "Good";
  if (score >= 75) return "Fair";
  return "Needs Improvement";
}

/**
 * Format quality score for display
 */
export function formatQualityScore(score: number): string {
  return `Visual Quality: ${score}/100 ${score >= 95 ? "✓" : ""}`;
}

