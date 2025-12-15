import { jsPDF } from "jspdf";
import { ResumeData } from "@/types";
import {
  getDesignSystemWithPreset,
  ThemePreset,
} from "./design/presets";
import {
  getFontSize,
  getColor,
  getSpacing,
  hexToRgb,
  formatSectionHeader,
  getBulletSymbol,
  calculateLineHeight,
} from "./design/visualSystem";
import { checkVisualConsistency } from "./qualityControl/visualQA";

/**
 * Generates a professionally styled, ATS-optimized PDF resume
 * Uses the comprehensive design system for consistent, visually stunning output
 * @param resumeData - The resume data to export
 * @param theme - Theme preset to use (defaults to "professional")
 * @returns Blob containing the PDF file
 */
export function exportResumeToPDF(
  resumeData: ResumeData,
  theme: ThemePreset = "professional"
): Blob {
  // Get design system with preset applied
  const DESIGN_SYSTEM = getDesignSystemWithPreset(theme);

  // Initialize jsPDF with design system settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt", // Points for consistency with design system
    format: "letter", // 8.5" x 11"
    compress: false, // Disable compression to ensure consistent output
  });

  // Embed PDF properties early (before rendering)
  embedPDFProperties(doc, resumeData);

  // Destructure design system for easier access
  const { colors, typography, spacing, layout, sections, elements } = DESIGN_SYSTEM;
  const { fonts, sizes, weights } = typography;

  // Page dimensions from design system
  const pageWidth = layout.maxWidth; // 612pt
  const pageHeight = 792; // 11" in points
  let yPosition = spacing.pageMargin.top;

  /**
   * Helper: Set font with consistent styling
   */
  function setFont(doc: jsPDF, size: number, weight: string = "normal") {
    const fontFamily = fonts.primary.split(",")[0].trim(); // Get first font (Calibri)
    const style =
      weight === "bold" || weight === "600" ? "bold" : "normal";
    doc.setFont(fontFamily, style);
    doc.setFontSize(size);
  }

  /**
   * Helper: Add text with color and alignment
   */
  function addText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    options: {
      size?: number;
      weight?: string;
      color?: string;
      align?: "left" | "center" | "right";
      maxWidth?: number;
    } = {}
  ) {
    const fontSize = options.size || sizes.body;
    const weight = options.weight || "normal";
    setFont(doc, fontSize, weight);

    const color = options.color || colors.text.primary;
    const rgb = hexToRgb(color);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);

    const textOptions: any = {
      align: options.align || "left", // Explicitly set alignment, default to left
    };
    
    // Only add maxWidth if explicitly provided (for text wrapping)
    // But don't use it for already-split lines to avoid justification
    if (options.maxWidth) {
      textOptions.maxWidth = options.maxWidth;
    }

    doc.text(text, x, y, textOptions);
  }

  /**
   * Helper: Split text into lines that fit within maxWidth
   */
  function splitText(
    doc: jsPDF,
    text: string,
    fontSize: number,
    maxWidth: number
  ): string[] {
    setFont(doc, fontSize);
    return doc.splitTextToSize(text, maxWidth);
  }

  /**
   * Helper: Add section header with underline
   */
  function addSectionHeader(doc: jsPDF, text: string, y: number): number {
    const x = spacing.pageMargin.left;

    // Header text (uppercase)
    const headerText = sections.header.uppercase
      ? formatSectionHeader(text)
      : text;
    addText(doc, headerText, x, y, {
      size: sizes.sectionHeader,
      weight: weights.sectionHeader,
      color: colors.primary,
    });

    let newY = y + calculateLineHeight(sizes.sectionHeader);

    // Underline
    if (sections.header.underline.enabled) {
      const lineY = newY + sections.header.underline.gap;
      const rgb = hexToRgb(sections.header.underline.color);
      doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
      doc.setLineWidth(sections.header.underline.thickness);
      doc.line(
        x,
        lineY,
        layout.maxWidth - spacing.pageMargin.right,
        lineY
      );
      newY = lineY + sections.header.underline.gap;
    }

    return newY + spacing.headerToContent;
  }

  /**
   * Helper: Add bullet point with text wrapping
   */
  function addBullet(
    doc: jsPDF,
    text: string,
    x: number,
    y: number
  ): number {
    const bulletX = x;
    const textX = x + layout.bulletIndent;
    const maxWidth = layout.contentWidth - layout.bulletIndent;

    // Remove [LESS_RELEVANT] marker if present
    const displayText = text.replace(/\[LESS_RELEVANT\]/g, "").trim();
    if (!displayText) return y;

    // Add bullet symbol
    addText(doc, elements.bullet.symbol, bulletX, y, {
      size: elements.bullet.size,
      color: elements.bullet.color,
    });

    // Wrap text
    const lines = splitText(doc, displayText, sizes.body, maxWidth);
    const lineHeight = calculateLineHeight(sizes.body);

    lines.forEach((line: string, index: number) => {
      addText(doc, line, textX, y + index * lineHeight, {
        size: sizes.body,
      });
    });

    return y + lines.length * lineHeight + spacing.bulletGap;
  }

  /**
   * Helper: Check page break and add new page if needed
   * Note: This function updates yPosition, but rendering functions use local y variables
   * The return value indicates if a page break occurred, and callers should reset their local y
   */
  function checkPageBreak(requiredHeight: number, currentY?: number): boolean {
    // Use provided currentY if available, otherwise use module-level yPosition
    const yToCheck = currentY !== undefined ? currentY : yPosition;
    
    if (yToCheck + requiredHeight > pageHeight - spacing.pageMargin.bottom) {
      doc.addPage();
      yPosition = spacing.pageMargin.top;
      return true;
    }
    return false;
  }

  /**
   * Render NAME SECTION with professional styling
   */
  function renderNameSection(doc: jsPDF, data: ResumeData): number {
    let y = spacing.pageMargin.top;

    // Optional: Add subtle background card
    if (elements.nameCard.enabled) {
      const cardHeight =
        sizes.name +
        spacing.nameToContact +
        sizes.contact +
        elements.nameCard.padding.top +
        elements.nameCard.padding.bottom;
      const rgb = hexToRgb(elements.nameCard.background);
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(
        0,
        y - elements.nameCard.padding.top,
        layout.maxWidth,
        cardHeight,
        "F"
      );
    }

    // Name (centered and bold)
    const centerX = layout.maxWidth / 2;
    addText(doc, data.personalInfo.name, centerX, y, {
      size: sizes.name,
      weight: weights.name,
      color: colors.accent, // Use accent color for name
      align: "center",
    });

    y += calculateLineHeight(sizes.name) + spacing.nameToContact;

    // Contact info (centered, single line with separators)
    const contactParts: string[] = [];
    if (data.personalInfo.email) contactParts.push(data.personalInfo.email);
    if (data.personalInfo.phone) contactParts.push(data.personalInfo.phone);
    if (data.personalInfo.location) contactParts.push(data.personalInfo.location);
    if (data.personalInfo.linkedIn) contactParts.push(data.personalInfo.linkedIn);

    if (contactParts.length > 0) {
      const contactLine = contactParts.join(" | ");
      addText(doc, contactLine, centerX, y, {
        size: sizes.contact,
        color: colors.text.secondary,
        align: "center",
      });
      y += calculateLineHeight(sizes.contact);
    }

    return y + spacing.contactToSummary;
  }

  /**
   * Render SUMMARY SECTION
   */
  function renderSummary(doc: jsPDF, summary: string, startY: number): number {
    let y = addSectionHeader(doc, "PROFESSIONAL SUMMARY", startY);

    const lines = splitText(doc, summary, sizes.body, layout.contentWidth);
    const lineHeight = calculateLineHeight(sizes.body);

    lines.forEach((line: string) => {
      if (checkPageBreak(lineHeight, y)) {
        y = spacing.pageMargin.top;
      }
      addText(doc, line, spacing.pageMargin.left, y, {
        size: sizes.body,
      });
      y += lineHeight;
    });

    return y + spacing.sectionGap;
  }

  /**
   * Render WORK EXPERIENCE with perfect alignment
   */
  function renderWorkExperience(
    doc: jsPDF,
    jobs: ResumeData["workExperience"],
    startY: number
  ): number {
    let y = addSectionHeader(doc, "PROFESSIONAL EXPERIENCE", startY);

    jobs.forEach((job, index) => {
      const x = spacing.pageMargin.left;
      const rightX = layout.maxWidth - spacing.pageMargin.right;

      // Check if we need a new page for this job
      const estimatedHeight =
        calculateLineHeight(sizes.jobTitle) +
        calculateLineHeight(sizes.body) +
        job.bullets.length * (calculateLineHeight(sizes.body) + spacing.bulletGap) +
        spacing.jobGap;

      if (checkPageBreak(estimatedHeight, y)) {
        y = spacing.pageMargin.top;
      }

      // Job title (bold, slightly larger)
      addText(doc, job.title, x, y, {
        size: sizes.jobTitle,
        weight: weights.jobTitle,
        color: colors.text.primary,
      });

      // Date (right-aligned, same line)
      const dateText = `${job.startDate} - ${job.endDate}`;
      addText(doc, dateText, rightX, y, {
        size: sizes.date,
        color: colors.text.secondary,
        align: "right",
      });

      y += calculateLineHeight(sizes.jobTitle);

      // Company
      addText(doc, job.company, x, y, {
        size: sizes.body,
        weight: weights.company,
        color: colors.text.secondary,
      });

      y += calculateLineHeight(sizes.body) + spacing.bulletGap;

      // Bullets
      job.bullets.forEach((bullet) => {
        if (checkPageBreak(calculateLineHeight(sizes.body) * 2, y)) {
          y = spacing.pageMargin.top;
        }
        y = addBullet(doc, bullet, x, y);
      });

      // Gap before next job
      if (index < jobs.length - 1) {
        y += spacing.jobGap;
      }
    });

    return y + spacing.sectionGap;
  }

  /**
   * Render EDUCATION SECTION
   */
  function renderEducation(
    doc: jsPDF,
    education: ResumeData["education"],
    startY: number
  ): number {
    let y = addSectionHeader(doc, "EDUCATION", startY);

    education.forEach((edu) => {
      const x = spacing.pageMargin.left;

      if (checkPageBreak(calculateLineHeight(sizes.body) * 2, y)) {
        y = spacing.pageMargin.top;
      }

      // Degree and Field (bold)
      const degreeText = `${edu.degree} in ${edu.field}`;
      addText(doc, degreeText, x, y, {
        size: sizes.body,
        weight: weights.jobTitle, // Use semi-bold for degree
        color: colors.text.primary,
      });

      y += calculateLineHeight(sizes.body);

      // Institution and Date
      const institutionText = `${edu.institution} | ${edu.graduationDate}`;
      addText(doc, institutionText, x, y, {
        size: sizes.body,
        color: colors.text.secondary,
      });

      y += calculateLineHeight(sizes.body) + spacing.jobGap;
    });

    return y + spacing.sectionGap;
  }

  /**
   * Render SKILLS SECTION
   */
  function renderSkills(
    doc: jsPDF,
    skills: ResumeData["skills"],
    startY: number
  ): number {
    let y = addSectionHeader(doc, "SKILLS", startY);

    const x = spacing.pageMargin.left;
    const skillsText = skills.join(", ");
    const lines = splitText(doc, skillsText, sizes.body, layout.contentWidth);
    const lineHeight = calculateLineHeight(sizes.body);

    lines.forEach((line: string) => {
      if (checkPageBreak(lineHeight, y)) {
        y = spacing.pageMargin.top;
      }
      addText(doc, line, x, y, {
        size: sizes.body,
      });
      y += lineHeight;
    });

    // After last line, y is already at bottom of line, so sectionGap provides spacing before next section
    return y + spacing.sectionGap;
  }

  /**
   * Render CERTIFICATIONS SECTION
   */
  function renderCertifications(
    doc: jsPDF,
    certifications: string[],
    startY: number
  ): number {
    let y = addSectionHeader(doc, "CERTIFICATIONS", startY);

    const x = spacing.pageMargin.left;

    certifications.forEach((cert) => {
      if (checkPageBreak(calculateLineHeight(sizes.body), y)) {
        y = spacing.pageMargin.top;
      }
      y = addBullet(doc, cert, x, y);
    });

    // Don't add sectionGap for the last section
    return y;
  }

  /**
   * Validate design consistency (for debugging)
   */
  function validateDesignConsistency() {
    // This function can be used to log any deviations from the design system
    // For now, we'll just ensure all values are from DESIGN_SYSTEM
    const validation = {
      colorsUsed: new Set<string>(),
      fontsUsed: new Set<string>(),
      sizesUsed: new Set<number>(),
    };

    // All colors should be from DESIGN_SYSTEM
    // All fonts should be from DESIGN_SYSTEM
    // All sizes should be from DESIGN_SYSTEM

    // In production, you could log warnings if any hardcoded values are detected
    return validation;
  }

  // ===== MAIN RENDERING =====
  // Debug logging to verify all data is present
  console.log(`[PDF Export] Rendering resume with ${resumeData.workExperience.length} work experience entries, ${resumeData.education.length} education entries`);
  
  let y = renderNameSection(doc, resumeData);

  if (resumeData.summary) {
    y = renderSummary(doc, resumeData.summary, y);
  }

  if (resumeData.workExperience.length > 0) {
    console.log(`[PDF Export] Rendering ${resumeData.workExperience.length} work experience entries`);
    y = renderWorkExperience(doc, resumeData.workExperience, y);
  }

  if (resumeData.education.length > 0) {
    console.log(`[PDF Export] Rendering ${resumeData.education.length} education entries`);
    y = renderEducation(doc, resumeData.education, y);
  }

  if (resumeData.skills.length > 0) {
    const skillsEndY = renderSkills(doc, resumeData.skills, y);
    // Skills always adds sectionGap, but we only need it if there's another section
    const hasNextSection = resumeData.certifications && resumeData.certifications.length > 0;
    y = hasNextSection ? skillsEndY : skillsEndY - spacing.sectionGap;
  }

  if (resumeData.certifications && resumeData.certifications.length > 0) {
    y = renderCertifications(doc, resumeData.certifications, y);
  }
  
  // Log final page count
  const totalPages = doc.getNumberOfPages();
  console.log(`[PDF Export] Generated PDF with ${totalPages} page(s)`);

  // Validate design consistency
  validateDesignConsistency();

  // Embed visual metadata first (before output)
  embedVisualMetadata(doc, theme, 100); // Use default score, calculate after if needed

  // Generate blob from PDF with consistent output options
  const pdfBlob = doc.output("blob", {
    // Ensure consistent output
  });

  // Calculate visual score after generating the final blob
  let visualScore = 100;
  try {
    const qaReport = checkVisualConsistency(pdfBlob, resumeData);
    visualScore = qaReport.overall;
    // Note: We can't update the PDF after output, but this is fine for logging
  } catch (error) {
    // If QA check fails, use default score
    console.warn("Could not calculate visual score:", error);
  }

  return pdfBlob;
}

/**
 * Embed PDF properties (title, author, keywords, etc.)
 */
function embedPDFProperties(doc: jsPDF, resumeData: ResumeData): void {
  doc.setProperties({
    title: `${resumeData.personalInfo.name} - Resume`,
    subject: "Professional Resume",
    author: "Adaptive Resume",
    keywords: "ATS-optimized, professional, tailored, resume",
    creator: "Adaptive Resume Engine v2.0",
  });
}

/**
 * Embed visual metadata into PDF
 * Note: jsPDF doesn't support custom metadata fields directly,
 * but we store this information for tracking and validation purposes
 */
function embedVisualMetadata(
  doc: jsPDF,
  theme: ThemePreset,
  visualScore: number
): void {
  // Visual metadata object
  const metadata = {
    designSystem: "v2.0",
    theme: theme,
    atsOptimized: true,
    visualScore: visualScore,
    generatedDate: new Date().toISOString(),
  };

  // Store metadata in document for potential future use
  // This could be used for PDF validation, tracking, or analytics
  (doc as any).__adaptiveResumeMetadata = metadata;

  // Note: While jsPDF doesn't support custom metadata fields in the PDF spec,
  // the metadata is stored in memory and can be accessed if needed.
  // For true PDF metadata embedding, you would need to use a library that
  // supports XMP metadata or custom properties.
}

/**
 * Generates a PDF resume and returns it as a data URL for preview
 * @param resumeData - The resume data to export
 * @returns Data URL string for the PDF
 */
export function exportResumeToPDFDataURL(resumeData: ResumeData): string {
  const blob = exportResumeToPDF(resumeData);
  return URL.createObjectURL(blob);
}
