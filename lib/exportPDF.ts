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
 * Generates a clean, ATS-friendly PDF resume from ResumeData
 * Uses the comprehensive styling system defined in resumeStyles
 * @param resumeData - The resume data to export
 * @returns Blob containing the PDF file
 */
export function exportResumeToPDF(resumeData: ResumeData): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  // Page dimensions in mm (US Letter: 8.5" x 11" = 215.9mm x 279.4mm)
  const pageWidth = 215.9;
  const pageHeight = 279.4;
  
  // Convert margins from inches to mm (1 inch = 25.4mm)
  const marginTop = resumeStyles.margins.top * 25.4;
  const marginRight = resumeStyles.margins.right * 25.4;
  const marginBottom = resumeStyles.margins.bottom * 25.4;
  const marginLeft = resumeStyles.margins.left * 25.4;
  
  const contentWidth = pageWidth - marginLeft - marginRight;
  let yPosition = marginTop;

  // Font sizes (converted from pt to mm: 1pt ≈ 0.352778mm)
  const nameSize = resumeStyles.fonts.sizes.name * 0.352778; // Convert pt to mm
  const contactSize = resumeStyles.fonts.sizes.contact * 0.352778;
  const sectionHeaderSize = resumeStyles.fonts.sizes.sectionHeader * 0.352778;
  const bodySize = resumeStyles.fonts.sizes.body * 0.352778;
  const bulletSize = resumeStyles.fonts.sizes.body * 0.352778;

  // Line heights (using lineHeight multiplier from styles)
  const nameLineHeight = nameSize * resumeStyles.spacing.lineHeight;
  const contactLineHeight = contactSize * resumeStyles.spacing.lineHeight;
  const sectionHeaderLineHeight = sectionHeaderSize * resumeStyles.spacing.lineHeight;
  const bodyLineHeight = bodySize * resumeStyles.spacing.lineHeight;
  const bulletLineHeight = bulletSize * resumeStyles.spacing.lineHeight;

  // Spacing (converted from points to mm: 1pt ≈ 0.352778mm)
  const sectionSpacing = resumeStyles.spacing.betweenSections * 0.352778;
  const subsectionSpacing = resumeStyles.spacing.betweenJobs * 0.352778;
  const bulletSpacing = 3; // Small spacing between bullets
  const sectionHeaderAbove = resumeStyles.spacing.sectionHeaderAbove * 0.352778;
  const sectionHeaderBelow = resumeStyles.spacing.sectionHeaderBelow * 0.352778;
  const bulletIndent = resumeStyles.spacing.bulletIndent * 25.4; // Convert inches to mm

  /**
   * Helper function to add a new page if needed
   * Respects maximum page limit from styles
   */
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - marginBottom) {
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      if (currentPage >= resumeStyles.length.maximum) {
        // Don't add more pages if we've reached the maximum
        // Instead, truncate content
        return false;
      }
      doc.addPage();
      yPosition = marginTop;
      return true;
    }
    return false;
  };

  /**
   * Helper function to split text into lines that fit within the content width
   */
  const splitText = (text: string, fontSize: number, maxWidth: number): string[] => {
    // Set font size before measuring
    const currentFontSize = doc.getFontSize();
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

    // Restore original font size
    doc.setFontSize(currentFontSize);
    
    return lines;
  };


  // ===== HEADER SECTION =====
  // Name - using styling system
  doc.setFontSize(nameSize);
  doc.setFont("helvetica", "bold");
  const nameLines = splitText(resumeData.personalInfo.name, nameSize, contentWidth);
  
  // Center or left-align name based on config
  const nameX = resumeStyles.layout.nameAlignment === "center" 
    ? pageWidth / 2 
    : marginLeft;
  
  for (const line of nameLines) {
    const textWidth = doc.getTextWidth(line);
    const xPos = resumeStyles.layout.nameAlignment === "center"
      ? (pageWidth - textWidth) / 2
      : nameX;
    doc.text(line, xPos, yPosition);
    yPosition += nameLineHeight;
  }
  yPosition += 2;

  // Contact Information - using helper function
  doc.setFontSize(contactSize);
  doc.setFont("helvetica", "normal");
  const contactLines = formatContactInfo(
    resumeData.personalInfo,
    resumeStyles.contact.format
  );
  
  for (const line of contactLines) {
    if (line === resumeData.personalInfo.name) continue; // Skip name, already printed
    
    const contactX = resumeStyles.layout.contactAlignment === "center"
      ? pageWidth / 2
      : marginLeft;
    
    const contactTextWidth = doc.getTextWidth(line);
    const xPos = resumeStyles.layout.contactAlignment === "center"
      ? (pageWidth - contactTextWidth) / 2
      : contactX;
    
    const contactTextLines = splitText(line, contactSize, contentWidth);
    for (const contactLine of contactTextLines) {
      doc.text(contactLine, xPos, yPosition);
      yPosition += contactLineHeight;
    }
  }
  yPosition += sectionSpacing;

  // ===== SUMMARY SECTION =====
  if (resumeData.summary) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * 3);
    yPosition += sectionHeaderAbove;
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    const summaryHeader = formatSectionHeader("PROFESSIONAL SUMMARY");
    doc.text(summaryHeader, marginLeft, yPosition);
    yPosition += sectionHeaderLineHeight;
    
    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      const underlineY = yPosition - 1;
      doc.setDrawColor(resumeStyles.colors.optional.underlineColor);
      doc.setLineWidth(resumeStyles.sections.headers.underlineWidth * 0.352778);
      doc.line(marginLeft, underlineY, marginLeft + contentWidth, underlineY);
    }
    
    yPosition += sectionHeaderBelow;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    const summaryLines = splitText(resumeData.summary, bodySize, contentWidth);
    for (const line of summaryLines) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = marginTop;
      }
      doc.text(line, marginLeft, yPosition);
      yPosition += bodyLineHeight;
    }
    yPosition += sectionSpacing;
  }

  // ===== WORK EXPERIENCE SECTION =====
  if (resumeData.workExperience.length > 0) {
    checkPageBreak(sectionHeaderLineHeight);
    yPosition += sectionHeaderAbove;
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    const workExpHeader = formatSectionHeader("WORK EXPERIENCE");
    doc.text(workExpHeader, marginLeft, yPosition);
    yPosition += sectionHeaderLineHeight;
    
    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      const underlineY = yPosition - 1;
      doc.setDrawColor(resumeStyles.colors.optional.underlineColor);
      doc.setLineWidth(resumeStyles.sections.headers.underlineWidth * 0.352778);
      doc.line(marginLeft, underlineY, marginLeft + contentWidth, underlineY);
    }
    
    yPosition += sectionHeaderBelow;

    for (const exp of resumeData.workExperience) {
      // Check if we need a new page for this experience entry
      const estimatedHeight =
        bodyLineHeight * 2 + // Title and company
        bulletLineHeight * (exp.bullets.length + 1) + // Bullets
        subsectionSpacing * 2;

      if (checkPageBreak(estimatedHeight)) {
        yPosition = marginTop;
      }

      // Job Title and Company
      doc.setFontSize(bodySize);
      doc.setFont("helvetica", "bold");
      const titleCompany = `${exp.title} | ${exp.company}`;
      const titleLines = splitText(titleCompany, bodySize, contentWidth);
      for (const line of titleLines) {
        doc.text(line, marginLeft, yPosition);
        yPosition += bodyLineHeight;
      }

      // Date Range - right-aligned per styling config
      doc.setFont("helvetica", "normal");
      const dateRange = formatDate(exp.startDate, exp.endDate);
      const dateWidth = doc.getTextWidth(dateRange);
      const dateX = marginLeft + contentWidth - dateWidth; // Right-align
      doc.text(dateRange, dateX, yPosition);
      yPosition += bodyLineHeight + bulletSpacing;

      // Bullet Points - limit per role based on config
      doc.setFontSize(bulletSize);
      const maxBullets = resumeStyles.workExperience.bullets.maxPerRole;
      const bulletsToShow = exp.bullets.slice(0, maxBullets);
      
      for (const bullet of bulletsToShow) {
        // Remove [LESS_RELEVANT] marker if present (for display, but keep it in data)
        const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
        if (!displayBullet) continue;

        const bulletChar = getBulletCharacter();
        const bulletText = `${bulletChar} ${displayBullet}`;
        const bulletLines = splitText(bulletText, bulletSize, contentWidth - bulletIndent);
        
        for (let i = 0; i < bulletLines.length; i++) {
          if (checkPageBreak(bulletLineHeight)) {
            yPosition = marginTop;
          }
          // Indent bullets per config
          const indent = marginLeft + (i === 0 ? 0 : bulletIndent);
          doc.text(bulletLines[i], indent, yPosition);
          yPosition += bulletLineHeight;
        }
        yPosition += bulletSpacing;
      }

      yPosition += subsectionSpacing;
    }
    yPosition += sectionSpacing - subsectionSpacing;
  }

  // ===== EDUCATION SECTION =====
  if (resumeData.education.length > 0) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * resumeData.education.length);
    yPosition += sectionHeaderAbove;
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    const educationHeader = formatSectionHeader("EDUCATION");
    doc.text(educationHeader, marginLeft, yPosition);
    yPosition += sectionHeaderLineHeight;
    
    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      const underlineY = yPosition - 1;
      doc.setDrawColor(resumeStyles.colors.optional.underlineColor);
      doc.setLineWidth(resumeStyles.sections.headers.underlineWidth * 0.352778);
      doc.line(marginLeft, underlineY, marginLeft + contentWidth, underlineY);
    }
    
    yPosition += sectionHeaderBelow;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");

    for (const edu of resumeData.education) {
      if (checkPageBreak(bodyLineHeight * 2)) {
        yPosition = marginTop;
      }

      // Degree and Field
      doc.setFont("helvetica", "bold");
      const degreeField = `${edu.degree} in ${edu.field}`;
      const degreeLines = splitText(degreeField, bodySize, contentWidth);
      for (const line of degreeLines) {
        doc.text(line, marginLeft, yPosition);
        yPosition += bodyLineHeight;
      }

      // Institution and Date
      doc.setFont("helvetica", "normal");
      const institutionDate = `${edu.institution} | ${edu.graduationDate}`;
      doc.text(institutionDate, marginLeft, yPosition);
      yPosition += bodyLineHeight + subsectionSpacing;
    }
    yPosition += sectionSpacing - subsectionSpacing;
  }

  // ===== SKILLS SECTION =====
  if (resumeData.skills.length > 0) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * 2);
    yPosition += sectionHeaderAbove;
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    const skillsHeader = formatSectionHeader("SKILLS");
    doc.text(skillsHeader, marginLeft, yPosition);
    yPosition += sectionHeaderLineHeight;
    
    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      const underlineY = yPosition - 1;
      doc.setDrawColor(resumeStyles.colors.optional.underlineColor);
      doc.setLineWidth(resumeStyles.sections.headers.underlineWidth * 0.352778);
      doc.line(marginLeft, underlineY, marginLeft + contentWidth, underlineY);
    }
    
    yPosition += sectionHeaderBelow;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    
    // Format skills based on config (categorized or comma-separated)
    let skillsText: string;
    if (resumeStyles.skills.format === "categorized" && resumeData.skills.length > resumeStyles.skills.maxForCommaSeparated) {
      // For now, use comma-separated (categorization would require AI/ML)
      skillsText = resumeData.skills.join(", ");
    } else {
      skillsText = resumeData.skills.join(", ");
    }
    
    const skillsLines = splitText(skillsText, bodySize, contentWidth);
    for (const line of skillsLines) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = marginTop;
      }
      doc.text(line, marginLeft, yPosition);
      yPosition += bodyLineHeight;
    }
    yPosition += sectionSpacing;
  }

  // ===== CERTIFICATIONS SECTION =====
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * resumeData.certifications.length);
    yPosition += sectionHeaderAbove;
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    const certHeader = formatSectionHeader("CERTIFICATIONS");
    doc.text(certHeader, marginLeft, yPosition);
    yPosition += sectionHeaderLineHeight;
    
    // Optional underline
    if (resumeStyles.sections.headers.underline) {
      const underlineY = yPosition - 1;
      doc.setDrawColor(resumeStyles.colors.optional.underlineColor);
      doc.setLineWidth(resumeStyles.sections.headers.underlineWidth * 0.352778);
      doc.line(marginLeft, underlineY, marginLeft + contentWidth, underlineY);
    }
    
    yPosition += sectionHeaderBelow;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    const bulletChar = getBulletCharacter();
    for (const cert of resumeData.certifications) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = marginTop;
      }
      doc.text(`${bulletChar} ${cert}`, marginLeft, yPosition);
      yPosition += bodyLineHeight;
    }
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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  // Same implementation as above, but return data URL
  // For now, we'll reuse the same logic
  const blob = exportResumeToPDF(resumeData);
  return URL.createObjectURL(blob);
}

