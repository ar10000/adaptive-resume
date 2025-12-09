/**
 * Comprehensive PDF Styling System for ATS-Optimized Resumes
 * 
 * This configuration defines ALL visual standards for resume generation
 * to ensure maximum compatibility with Applicant Tracking Systems (ATS).
 */

export interface ResumeStyleConfig {
  fonts: FontConfig;
  margins: MarginConfig;
  spacing: SpacingConfig;
  layout: LayoutConfig;
  sections: SectionConfig;
  contact: ContactConfig;
  workExperience: WorkExperienceConfig;
  dates: DateConfig;
  skills: SkillsConfig;
  length: LengthConfig;
  colors: ColorConfig;
  whitespace: WhitespaceConfig;
  atsAvoid: ATSAvoidConfig;
}

export interface FontConfig {
  primary: {
    family: string;
    size: number; // in points
    alternatives: string[];
  };
  sizes: {
    name: number; // 16-18pt
    sectionHeader: number; // 12pt
    contact: number; // 10pt
    body: number; // 10-11pt
  };
  weights: {
    normal: number;
    bold: number;
  };
  avoid: string[]; // Fonts to never use
}

export interface MarginConfig {
  top: number; // inches (0.5-0.75)
  right: number; // inches (0.5-0.75)
  bottom: number; // inches (0.5-0.75)
  left: number; // inches (0.5-0.75)
}

export interface SpacingConfig {
  betweenSections: number; // points (12-16pt)
  betweenJobs: number; // points (8-10pt)
  lineHeight: number; // 1.15-1.3
  bulletIndent: number; // inches (0.25)
  sectionHeaderAbove: number; // points (16pt)
  sectionHeaderBelow: number; // points (8pt)
}

export interface LayoutConfig {
  structure: "single-column"; // Only single column allowed
  alignment: "left" | "center";
  nameAlignment: "left" | "center";
  contactAlignment: "left" | "center";
  prohibited: string[]; // Layout elements to never use
}

export interface SectionConfig {
  order: string[]; // Standard section order
  headers: {
    format: "uppercase" | "title-case";
    style: "bold";
    underline: boolean; // Optional 2pt horizontal line
    underlineColor: string; // Dark gray
    underlineWidth: number; // 1-2pt
  };
}

export interface ContactConfig {
  format: "inline" | "separate-lines";
  separator: string; // "|" for inline format
  include: {
    name: boolean;
    email: boolean;
    phone: boolean;
    location: boolean;
    linkedIn: boolean;
  };
  exclude: string[]; // What to never include
}

export interface WorkExperienceConfig {
  bullets: {
    style: "filled-circle" | "dash"; // • or —
    maxPerRole: number; // 3-5, max 6 for most recent
    indent: number; // inches (0.25)
    format: string; // "Action verb + specific task + measurable result"
    actionVerbs: string[]; // Preferred action verbs
  };
  dateAlignment: "right"; // Right-aligned next to company name
  companyFormat: string; // "Company Name | Location"
}

export interface DateConfig {
  format: "short" | "long"; // "Jan 2025" or "2025"
  currentLabel: string; // "Present"
  separator: string; // " - "
  example: string; // "Jan 2025 - Present"
}

export interface SkillsConfig {
  format: "categorized" | "comma-separated";
  maxForCommaSeparated: number; // 15 skills
  categories: string[]; // Common skill categories
}

export interface LengthConfig {
  target: {
    lessThan10Years: number; // 1 page
    tenPlusYears: number; // 2 pages
  };
  maximum: number; // 2 pages
  neverExceed: number; // 3 pages (hard limit)
  strategy: string; // How to handle overflow
}

export interface ColorConfig {
  primary: {
    text: string; // Black
    background: string; // White
  };
  optional: {
    nameColor: string; // Dark navy or charcoal
    underlineColor: string; // Dark gray (1-2pt)
  };
  prohibited: string[]; // Colors/styles to never use
}

export interface WhitespaceConfig {
  strategy: "strategic" | "minimal" | "balanced";
  groupRelated: boolean;
  breathingRoom: boolean;
  avoidEdgeToEdge: boolean;
}

export interface ATSAvoidConfig {
  elements: string[]; // Elements that will cause ATS rejection
  formatting: string[]; // Formatting to avoid
  content: string[]; // Content patterns to avoid
}

/**
 * Default ATS-Optimized Resume Style Configuration
 */
export const resumeStyles: ResumeStyleConfig = {
  fonts: {
    primary: {
      family: "Calibri",
      size: 11, // points
      alternatives: ["Arial", "Helvetica", "Georgia"],
    },
    sizes: {
      name: 17, // 16-18pt (using 17pt as middle ground)
      sectionHeader: 12, // 12pt
      contact: 10, // 10pt
      body: 11, // 10-11pt (using 11pt to match primary)
    },
    weights: {
      normal: 400,
      bold: 700,
    },
    avoid: [
      "Times New Roman", // Outdated
      "Comic Sans",
      "Papyrus",
      "Courier New", // Unless specifically required
      // Any decorative or custom fonts
    ],
  },

  margins: {
    top: 0.6, // inches (0.5-0.75, using 0.6 as balanced)
    right: 0.6, // inches
    bottom: 0.6, // inches
    left: 0.6, // inches
  },

  spacing: {
    betweenSections: 14, // points (12-16pt, using 14pt)
    betweenJobs: 9, // points (8-10pt, using 9pt)
    lineHeight: 1.2, // 1.15-1.3 (using 1.2 as balanced)
    bulletIndent: 0.25, // inches
    sectionHeaderAbove: 16, // points
    sectionHeaderBelow: 8, // points
  },

  layout: {
    structure: "single-column", // CRITICAL: Only single column
    alignment: "left",
    nameAlignment: "center", // Can be center or left
    contactAlignment: "center", // Can be center or left
    prohibited: [
      "two-column",
      "tables-for-content",
      "text-boxes",
      "headers-with-content",
      "footers-with-content",
    ],
  },

  sections: {
    order: [
      "name-contact",
      "summary",
      "work-experience",
      "education",
      "skills",
      "certifications",
    ],
    headers: {
      format: "uppercase",
      style: "bold",
      underline: true, // Optional subtle line
      underlineColor: "#666666", // Dark gray
      underlineWidth: 1, // 1-2pt (using 1pt for subtlety)
    },
  },

  contact: {
    format: "separate-lines", // "inline" or "separate-lines"
    separator: "|", // Used for inline format
    include: {
      name: true,
      email: true,
      phone: true,
      location: true,
      linkedIn: true,
    },
    exclude: [
      "full-street-address",
      "profile-photos",
      "social-media-other-than-linkedin",
    ],
  },

  workExperience: {
    bullets: {
      style: "filled-circle", // • (can also use "dash" for —)
      maxPerRole: 5, // 3-5 bullets (max 6 for most recent)
      indent: 0.25, // inches
      format: "Action verb + specific task + measurable result",
      actionVerbs: [
        "Built",
        "Architected",
        "Developed",
        "Designed",
        "Implemented",
        "Led",
        "Managed",
        "Optimized",
        "Created",
        "Established",
        "Improved",
        "Increased",
        "Reduced",
        "Achieved",
        "Delivered",
        "Launched",
        "Scaled",
        "Automated",
        "Streamlined",
        "Enhanced",
      ],
    },
    dateAlignment: "right",
    companyFormat: "Company Name | Location", // Optional location
  },

  dates: {
    format: "short", // "Jan 2025" (can use "long" for "2025")
    currentLabel: "Present",
    separator: " - ",
    example: "Jan 2025 - Present",
  },

  skills: {
    format: "categorized", // "categorized" or "comma-separated"
    maxForCommaSeparated: 15,
    categories: [
      "Technical",
      "Tools & Platforms",
      "Core Competencies",
      "Languages",
      "Frameworks",
      "Databases",
      "Cloud Services",
    ],
  },

  length: {
    target: {
      lessThan10Years: 1, // 1 page
      tenPlusYears: 2, // 2 pages
    },
    maximum: 2, // pages
    neverExceed: 3, // pages (hard limit)
    strategy: "Remove older/less relevant positions if content exceeds 2 pages",
  },

  colors: {
    primary: {
      text: "#000000", // Black
      background: "#FFFFFF", // White
    },
    optional: {
      nameColor: "#1a1a1a", // Dark navy/charcoal (optional)
      underlineColor: "#666666", // Dark gray for section header underlines
    },
    prohibited: [
      "colored-backgrounds",
      "bright-colors",
      "gradients",
      "patterns",
    ],
  },

  whitespace: {
    strategy: "balanced", // "strategic" | "minimal" | "balanced"
    groupRelated: true,
    breathingRoom: true,
    avoidEdgeToEdge: true,
  },

  atsAvoid: {
    elements: [
      "images",
      "logos",
      "profile-photos",
      "charts",
      "graphs",
      "rating-bars-for-skills",
      "text-boxes",
      "tables-for-content",
      "two-column-layouts",
      "headers-with-critical-info",
      "footers-with-critical-info",
      "fancy-graphics",
      "icons",
    ],
    formatting: [
      "hyperlinks-that-arent-plain-text",
      "abbreviations-without-spelling-out",
      "complex-nested-structures",
      "watermarks",
      "password-protection",
    ],
    content: [
      "unnecessary-personal-information",
      "references-in-resume-body",
      "objective-statements-unless-entry-level",
    ],
  },
};

/**
 * Helper function to get font family with fallback
 */
export function getFontFamily(): string {
  const { primary, alternatives } = resumeStyles.fonts.primary;
  return `${primary}, ${alternatives.join(", ")}, sans-serif`;
}

/**
 * Helper function to check if a font should be avoided
 */
export function isFontAvoided(fontName: string): boolean {
  return resumeStyles.fonts.avoid.some(
    (avoided) => avoided.toLowerCase() === fontName.toLowerCase()
  );
}

/**
 * Helper function to get section header text
 */
export function formatSectionHeader(sectionName: string): string {
  if (resumeStyles.sections.headers.format === "uppercase") {
    return sectionName.toUpperCase();
  }
  return sectionName;
}

/**
 * Helper function to format dates consistently
 */
export function formatDate(
  startDate: string,
  endDate: string,
  format: "short" | "long" = resumeStyles.dates.format
): string {
  const formatDateString = (dateStr: string): string => {
    if (dateStr === "Present" || dateStr.toLowerCase() === "present") {
      return resumeStyles.dates.currentLabel;
    }

    // Try to parse the date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If parsing fails, try to extract year
      const yearMatch = dateStr.match(/\d{4}/);
      if (yearMatch) {
        return format === "short" ? yearMatch[0] : yearMatch[0];
      }
      return dateStr; // Return as-is if we can't parse
    }

    if (format === "short") {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${month} ${year}`;
    } else {
      return date.getFullYear().toString();
    }
  };

  const formattedStart = formatDateString(startDate);
  const formattedEnd = formatDateString(endDate);

  return `${formattedStart}${resumeStyles.dates.separator}${formattedEnd}`;
}

/**
 * Helper function to format contact information
 */
export function formatContactInfo(
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
  },
  format: "inline" | "separate-lines" = resumeStyles.contact.format
): string[] {
  const lines: string[] = [];

  // Name always on its own line
  lines.push(personalInfo.name);

  if (format === "inline") {
    // Inline format: Email | Phone | Location | LinkedIn
    const parts: string[] = [];
    if (personalInfo.email) parts.push(personalInfo.email);
    if (personalInfo.phone) parts.push(personalInfo.phone);
    if (personalInfo.location) parts.push(personalInfo.location);
    if (personalInfo.linkedIn) parts.push(personalInfo.linkedIn);
    if (parts.length > 0) {
      lines.push(parts.join(` ${resumeStyles.contact.separator} `));
    }
  } else {
    // Separate lines format
    if (personalInfo.email) lines.push(personalInfo.email);
    if (personalInfo.phone) lines.push(personalInfo.phone);
    if (personalInfo.location) lines.push(personalInfo.location);
    if (personalInfo.linkedIn) lines.push(personalInfo.linkedIn);
  }

  return lines;
}

/**
 * Helper function to categorize skills
 */
export function categorizeSkills(
  skills: string[],
  categories: string[] = resumeStyles.skills.categories
): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};

  // Simple categorization logic (can be enhanced with AI/ML)
  // For now, this is a placeholder - actual categorization should be done
  // by the resume generator based on context

  // If skills are few, return uncategorized
  if (skills.length <= resumeStyles.skills.maxForCommaSeparated) {
    return { "All Skills": skills };
  }

  // Default: put all in "Technical" category
  // In practice, this should be done by the generator based on skill types
  categorized["Technical"] = skills;

  return categorized;
}

/**
 * Helper function to get bullet character
 */
export function getBulletCharacter(): string {
  return resumeStyles.workExperience.bullets.style === "filled-circle"
    ? "•"
    : "—";
}

/**
 * Helper function to validate resume against ATS requirements
 */
export function validateATSCompliance(resumeData: any): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check for prohibited elements (would need to check actual PDF content)
  // This is a placeholder for validation logic

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Export default configuration
 */
export default resumeStyles;

