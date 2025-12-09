import jsPDF from "jspdf";
import { ResumeData } from "@/types";
import resumeStyles, {
  getFontFamily,
  formatSectionHeader,
  formatDate,
  formatContactInfo,
  getBulletCharacter,
} from "./styles/resumeStyles";

/**
 * Generates a professionally styled, ATS-optimized PDF resume
 * Implements comprehensive styling system with smart page breaks and text wrapping
 * @param resumeData - The resume data to export
 * @returns Blob containing the PDF file
 */
export function exportResumeToPDF(resumeData: ResumeData): Blob {
  // Initialize jsPDF with professional settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter", // 8.5" x 11"
    compress: true,
  });

  // Page dimensions in points (US Letter: 8.5" x 11" = 612pt x 792pt)
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 36; // 0.5 inch in points (0.5 * 72)
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Font sizes from styling system (in points)
  const nameSize = resumeStyles.fonts.sizes.name; // 17pt
  const contactSize = resumeStyles.fonts.sizes.contact; // 10pt
  const sectionHeaderSize = resumeStyles.fonts.sizes.sectionHeader; // 12pt
  const bodySize = resumeStyles.fonts.sizes.body; // 11pt
  const bulletSize = 10; // 10pt for bullets

  // Line heights (multiply font size by line height ratio)
  const nameLineHeight = nameSize * resumeStyles.spacing.lineHeight;
  const contactLineHeight = contactSize * resumeStyles.spacing.lineHeight;
  const sectionHeaderLineHeight = sectionHeaderSize * resumeStyles.spacing.lineHeight;
  const bodyLineHeight = bodySize * resumeStyles.spacing.lineHeight;
  const bulletLineHeight = bulletSize * resumeStyles.spacing.lineHeight;

  // Spacing values (in points)
  const sectionSpacing = resumeStyles.spacing.betweenSections; // 14pt
  const jobSpacing = resumeStyles.spacing.betweenJobs; // 9pt
  const sectionHeaderAbove = resumeStyles.spacing.sectionHeaderAbove; // 16pt
  const sectionHeaderBelow = resumeStyles.spacing.sectionHeaderBelow; // 8pt
  const bulletIndent = resumeStyles.spacing.bulletIndent * 72; // Convert inches to points (0.25" = 18pt)

  // Colors
  const textColor = resumeStyles.colors.primary.text; // Black
  const contactColor = "#555555"; // Gray for contact info
  const underlineColor = [200, 200, 200]; // RGB for subtle underlines
  const separatorColor = [220, 220, 220]; // RGB for job separators

  /**
   * Set text color
   */
  const setTextColor = (color: string) => {
    const rgb = hexToRgb(color);
    if (rgb) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
    }
  };

  /**
   * Convert hex color to RGB
   */
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  /**
   * Check if we need a new page and add it if necessary
   * Returns true if a new page was added
   */
  const checkPageBreak = (requiredHeight: number): boolean => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      // Check page limit
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage >= resumeStyles.length.maximum) {
        return false; // Don't add more pages
      }

      // Add "Continued..." at bottom of current page
      const continuedY = pageHeight - margin + 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      setTextColor("#888888");
      doc.text("Continued...", pageWidth - margin - 40, continuedY);

      // Add new page
      doc.addPage();

      // Add "(Continued)" at top of new page
      yPosition = margin;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      setTextColor("#888888");
      doc.text("(Continued)", margin, yPosition);
      yPosition += 12; // Small spacing after continued marker

      // Reset text color
      setTextColor(textColor);
      return true;
    }
    return false;
  };

  /**
   * Smart text wrapping with proper indentation
   * Returns array of lines that fit within maxWidth
   */
  const splitText = (
    text: string,
    fontSize: number,
    maxWidth: number,
    indent: number = 0
  ): string[] => {
    doc.setFontSize(fontSize);
    const lines: string[] = [];
    const words = text.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = doc.getTextWidth(testLine);

      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  /**
   * Add text with proper wrapping and page breaks
   */
  const addWrappedText = (
    text: string,
    fontSize: number,
    x: number,
    maxWidth: number,
    lineHeight: number,
    indent: number = 0
  ): number => {
    const lines = splitText(text, fontSize, maxWidth - indent, indent);
    let currentY = yPosition;

    for (let i = 0; i < lines.length; i++) {
      if (checkPageBreak(lineHeight)) {
        currentY = yPosition;
      }

      const xPos = i === 0 ? x : x + indent; // Hanging indent for continuation lines
      doc.setFontSize(fontSize);
      doc.text(lines[i], xPos, currentY);
      currentY += lineHeight;
    }

    return currentY - yPosition; // Return height used
  };

  /**
   * Add a section header with optional underline
   */
  const addSectionHeader = (headerText: string): void => {
    yPosition += sectionHeaderAbove;

    if (checkPageBreak(sectionHeaderLineHeight + sectionHeaderBelow + 5)) {
      yPosition = margin + 12; // Account for "(Continued)" if present
    }

    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    setTextColor(textColor);
    const formattedHeader = formatSectionHeader(headerText);
    doc.text(formattedHeader, margin, yPosition);
    yPosition += sectionHeaderLineHeight;

    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      doc.setDrawColor(underlineColor[0], underlineColor[1], underlineColor[2]);
      doc.setLineWidth(1);
      const underlineY = yPosition - 2;
      doc.line(margin, underlineY, margin + contentWidth, underlineY);
    }

    yPosition += sectionHeaderBelow;
  };

  /**
   * Add a subtle separator line between jobs
   */
  const addJobSeparator = (): void => {
    if (yPosition + 5 > pageHeight - margin) {
      return; // Don't add separator if too close to bottom
    }
    doc.setDrawColor(separatorColor[0], separatorColor[1], separatorColor[2]);
    doc.setLineWidth(0.5);
    const separatorY = yPosition + jobSpacing / 2;
    doc.line(margin, separatorY, margin + contentWidth, separatorY);
  };

  // ===== HEADER SECTION =====
  // Name
  doc.setFontSize(nameSize);
  doc.setFont("helvetica", "bold");
  setTextColor(textColor);

  const nameX =
    resumeStyles.layout.nameAlignment === "center"
      ? pageWidth / 2
      : margin;
  const nameLines = splitText(resumeData.personalInfo.name, nameSize, contentWidth);
  for (const line of nameLines) {
    const textWidth = doc.getTextWidth(line);
    const xPos =
      resumeStyles.layout.nameAlignment === "center"
        ? (pageWidth - textWidth) / 2
        : nameX;
    doc.text(line, xPos, yPosition);
    yPosition += nameLineHeight;
  }
  yPosition += 4; // Small spacing after name

  // Contact Information
  doc.setFontSize(contactSize);
  doc.setFont("helvetica", "normal");
  setTextColor(contactColor);

  const contactLines = formatContactInfo(
    resumeData.personalInfo,
    resumeStyles.contact.format
  );

  for (const line of contactLines) {
    if (line === resumeData.personalInfo.name) continue; // Skip name, already printed

    const contactX =
      resumeStyles.layout.contactAlignment === "center"
        ? pageWidth / 2
        : margin;

    const contactTextLines = splitText(line, contactSize, contentWidth);
    for (const contactLine of contactTextLines) {
      const textWidth = doc.getTextWidth(contactLine);
      const xPos =
        resumeStyles.layout.contactAlignment === "center"
          ? (pageWidth - textWidth) / 2
          : contactX;
      doc.text(contactLine, xPos, yPosition);
      yPosition += contactLineHeight;
    }
  }

  // Reset text color to black
  setTextColor(textColor);
  yPosition += sectionSpacing;

  // ===== SUMMARY SECTION =====
  if (resumeData.summary) {
    addSectionHeader("PROFESSIONAL SUMMARY");

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    const summaryHeight = addWrappedText(
      resumeData.summary,
      bodySize,
      margin,
      contentWidth,
      bodyLineHeight
    );
    yPosition += summaryHeight;
    yPosition += sectionSpacing;
  }

  // ===== WORK EXPERIENCE SECTION =====
  if (resumeData.workExperience.length > 0) {
    addSectionHeader("WORK EXPERIENCE");

    for (let i = 0; i < resumeData.workExperience.length; i++) {
      const exp = resumeData.workExperience[i];
      const isLastJob = i === resumeData.workExperience.length - 1;

      // Estimate height needed for this job entry
      const estimatedHeight =
        bodyLineHeight * 2 + // Title and company line
        bodyLineHeight + // Date line
        bulletLineHeight * Math.min(exp.bullets.length, resumeStyles.workExperience.bullets.maxPerRole) +
        jobSpacing;

      if (checkPageBreak(estimatedHeight)) {
        yPosition = margin + 12; // Account for "(Continued)" if present
      }

      // Job Title (bold)
      doc.setFontSize(bodySize);
      doc.setFont("helvetica", "bold");
      setTextColor(textColor);
      const titleHeight = addWrappedText(
        exp.title,
        bodySize,
        margin,
        contentWidth,
        bodyLineHeight
      );
      yPosition += titleHeight;

      // Company & Location (regular)
      doc.setFont("helvetica", "normal");
      const companyLocation = exp.company;
      const companyHeight = addWrappedText(
        companyLocation,
        bodySize,
        margin,
        contentWidth,
        bodyLineHeight
      );
      yPosition += companyHeight;

      // Date Range (right-aligned, regular)
      doc.setFont("helvetica", "normal");
      const dateRange = formatDate(exp.startDate, exp.endDate);
      const dateWidth = doc.getTextWidth(dateRange);
      const dateX = margin + contentWidth - dateWidth;
      doc.text(dateRange, dateX, yPosition - companyHeight); // Align with company line
      yPosition += bodyLineHeight + 4; // Small spacing before bullets

      // Bullet Points with proper indentation
      doc.setFontSize(bulletSize);
      const bulletChar = getBulletCharacter();
      const maxBullets = resumeStyles.workExperience.bullets.maxPerRole;
      const bulletsToShow = exp.bullets.slice(0, maxBullets);

      for (const bullet of bulletsToShow) {
        // Remove [LESS_RELEVANT] marker if present
        const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
        if (!displayBullet) continue;

        const bulletText = `${bulletChar} ${displayBullet}`;
        const bulletMaxWidth = contentWidth - bulletIndent;

        // Check if bullet will fit on current page
        const bulletLines = splitText(bulletText, bulletSize, bulletMaxWidth, bulletIndent);
        const bulletHeight = bulletLines.length * bulletLineHeight;

        if (checkPageBreak(bulletHeight)) {
          yPosition = margin + 12; // Account for "(Continued)" if present
        }

        // Add bullet with hanging indent
        for (let j = 0; j < bulletLines.length; j++) {
          const xPos = j === 0 ? margin : margin + bulletIndent;
          doc.text(bulletLines[j], xPos, yPosition);
          yPosition += bulletLineHeight;
        }
        yPosition += 2; // Small spacing between bullets
      }

      // Add separator line between jobs (except after last job)
      if (!isLastJob) {
        yPosition += jobSpacing / 2 - 2;
        addJobSeparator();
        yPosition += jobSpacing / 2;
      } else {
        yPosition += jobSpacing;
      }
    }

    yPosition += sectionSpacing - jobSpacing;
  }

  // ===== EDUCATION SECTION =====
  if (resumeData.education.length > 0) {
    addSectionHeader("EDUCATION");

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");

    for (const edu of resumeData.education) {
      if (checkPageBreak(bodyLineHeight * 2)) {
        yPosition = margin + 12;
      }

      // Degree and Field (bold)
      doc.setFont("helvetica", "bold");
      const degreeField = `${edu.degree} in ${edu.field}`;
      const degreeHeight = addWrappedText(
        degreeField,
        bodySize,
        margin,
        contentWidth,
        bodyLineHeight
      );
      yPosition += degreeHeight;

      // Institution and Date (regular)
      doc.setFont("helvetica", "normal");
      const institutionDate = `${edu.institution} | ${edu.graduationDate}`;
      const institutionHeight = addWrappedText(
        institutionDate,
        bodySize,
        margin,
        contentWidth,
        bodyLineHeight
      );
      yPosition += institutionHeight;
      yPosition += jobSpacing;
    }

    yPosition += sectionSpacing - jobSpacing;
  }

  // ===== SKILLS SECTION =====
  if (resumeData.skills.length > 0) {
    addSectionHeader("SKILLS");

    doc.setFontSize(bulletSize); // 10pt for skills

    // Format skills based on config
    if (
      resumeStyles.skills.format === "categorized" &&
      resumeData.skills.length > resumeStyles.skills.maxForCommaSeparated
    ) {
      // Categorized format (simplified - would need AI for proper categorization)
      // For now, use comma-separated but could be enhanced
      const skillsText = resumeData.skills.join(", ");
      const skillsHeight = addWrappedText(
        skillsText,
        bulletSize,
        margin,
        contentWidth,
        bulletLineHeight
      );
      yPosition += skillsHeight;
    } else {
      // Comma-separated format
      const skillsText = resumeData.skills.join(", ");
      const skillsHeight = addWrappedText(
        skillsText,
        bulletSize,
        margin,
        contentWidth,
        bulletLineHeight
      );
      yPosition += skillsHeight;
    }

    yPosition += sectionSpacing;
  }

  // ===== CERTIFICATIONS SECTION =====
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addSectionHeader("CERTIFICATIONS");

    doc.setFontSize(bulletSize);
    doc.setFont("helvetica", "normal");
    const bulletChar = getBulletCharacter();

    for (const cert of resumeData.certifications) {
      if (checkPageBreak(bulletLineHeight)) {
        yPosition = margin + 12;
      }

      const certText = `${bulletChar} ${cert}`;
      const certHeight = addWrappedText(
        certText,
        bulletSize,
        margin,
        contentWidth,
        bulletLineHeight
      );
      yPosition += certHeight;
      yPosition += 2; // Small spacing between certifications
    }
  }

  // Quality checks
  // Ensure no text is cut off at the bottom
  if (yPosition > pageHeight - margin) {
    // This shouldn't happen due to checkPageBreak, but as a safety measure
    console.warn("Resume content may extend beyond page boundary");
  }

  // Generate blob from PDF
  const pdfBlob = doc.output("blob");
  return pdfBlob;
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
