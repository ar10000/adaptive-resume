import jsPDF from "jspdf";
import { ResumeData } from "@/types";

/**
 * Generates a clean, ATS-friendly PDF resume from ResumeData
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
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Font sizes (converted from pt to mm: 1pt ≈ 0.352778mm)
  const nameSize = 16; // 16pt
  const contactSize = 11; // 11pt
  const sectionHeaderSize = 12; // 12pt
  const bodySize = 10; // 10pt
  const bulletSize = 10; // 10pt

  // Line heights
  const nameLineHeight = nameSize * 0.4;
  const contactLineHeight = contactSize * 0.4;
  const sectionHeaderLineHeight = sectionHeaderSize * 0.4;
  const bodyLineHeight = bodySize * 0.4;
  const bulletLineHeight = bulletSize * 0.4;

  // Spacing
  const sectionSpacing = 8;
  const subsectionSpacing = 4;
  const bulletSpacing = 3;

  /**
   * Helper function to add a new page if needed
   */
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
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
  // Name
  doc.setFontSize(nameSize);
  doc.setFont("helvetica", "bold");
  const nameLines = splitText(resumeData.personalInfo.name, nameSize, contentWidth);
  for (const line of nameLines) {
    doc.text(line, margin, yPosition);
    yPosition += nameLineHeight;
  }
  yPosition += 2;

  // Contact Information
  doc.setFontSize(contactSize);
  doc.setFont("helvetica", "normal");
  const contactInfo: string[] = [];
  if (resumeData.personalInfo.email) {
    contactInfo.push(resumeData.personalInfo.email);
  }
  if (resumeData.personalInfo.phone) {
    contactInfo.push(resumeData.personalInfo.phone);
  }
  if (resumeData.personalInfo.location) {
    contactInfo.push(resumeData.personalInfo.location);
  }
  if (resumeData.personalInfo.linkedIn) {
    contactInfo.push(resumeData.personalInfo.linkedIn);
  }

  const contactText = contactInfo.join(" | ");
  if (contactText) {
    const contactLines = splitText(contactText, contactSize, contentWidth);
    for (const line of contactLines) {
      doc.text(line, margin, yPosition);
      yPosition += contactLineHeight;
    }
  }
  yPosition += sectionSpacing;

  // ===== SUMMARY SECTION =====
  if (resumeData.summary) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * 3);
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", margin, yPosition);
    yPosition += sectionHeaderLineHeight + 2;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    const summaryLines = splitText(resumeData.summary, bodySize, contentWidth);
    for (const line of summaryLines) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += bodyLineHeight;
    }
    yPosition += sectionSpacing;
  }

  // ===== WORK EXPERIENCE SECTION =====
  if (resumeData.workExperience.length > 0) {
    checkPageBreak(sectionHeaderLineHeight);
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    doc.text("WORK EXPERIENCE", margin, yPosition);
    yPosition += sectionHeaderLineHeight + subsectionSpacing;

    for (const exp of resumeData.workExperience) {
      // Check if we need a new page for this experience entry
      const estimatedHeight =
        bodyLineHeight * 2 + // Title and company
        bulletLineHeight * (exp.bullets.length + 1) + // Bullets
        subsectionSpacing * 2;

      if (checkPageBreak(estimatedHeight)) {
        yPosition = margin;
      }

      // Job Title and Company
      doc.setFontSize(bodySize);
      doc.setFont("helvetica", "bold");
      const titleCompany = `${exp.title} | ${exp.company}`;
      const titleLines = splitText(titleCompany, bodySize, contentWidth);
      for (const line of titleLines) {
        doc.text(line, margin, yPosition);
        yPosition += bodyLineHeight;
      }

      // Date Range
      doc.setFont("helvetica", "normal");
      const dateRange = `${exp.startDate} - ${exp.endDate}`;
      doc.text(dateRange, margin, yPosition);
      yPosition += bodyLineHeight + bulletSpacing;

      // Bullet Points
      doc.setFontSize(bulletSize);
      for (const bullet of exp.bullets) {
        // Remove [LESS_RELEVANT] marker if present (for display, but keep it in data)
        const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
        if (!displayBullet) continue;

        const bulletLines = splitText(`• ${displayBullet}`, bulletSize, contentWidth);
        for (let i = 0; i < bulletLines.length; i++) {
          if (checkPageBreak(bulletLineHeight)) {
            yPosition = margin;
          }
          const indent = i === 0 ? margin : margin + 5; // Indent continuation lines
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
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    doc.text("EDUCATION", margin, yPosition);
    yPosition += sectionHeaderLineHeight + subsectionSpacing;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");

    for (const edu of resumeData.education) {
      if (checkPageBreak(bodyLineHeight * 2)) {
        yPosition = margin;
      }

      // Degree and Field
      doc.setFont("helvetica", "bold");
      const degreeField = `${edu.degree} in ${edu.field}`;
      const degreeLines = splitText(degreeField, bodySize, contentWidth);
      for (const line of degreeLines) {
        doc.text(line, margin, yPosition);
        yPosition += bodyLineHeight;
      }

      // Institution and Date
      doc.setFont("helvetica", "normal");
      const institutionDate = `${edu.institution} | ${edu.graduationDate}`;
      doc.text(institutionDate, margin, yPosition);
      yPosition += bodyLineHeight + subsectionSpacing;
    }
    yPosition += sectionSpacing - subsectionSpacing;
  }

  // ===== SKILLS SECTION =====
  if (resumeData.skills.length > 0) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * 2);
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    doc.text("SKILLS", margin, yPosition);
    yPosition += sectionHeaderLineHeight + subsectionSpacing;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    const skillsText = resumeData.skills.join(", ");
    const skillsLines = splitText(skillsText, bodySize, contentWidth);
    for (const line of skillsLines) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += bodyLineHeight;
    }
    yPosition += sectionSpacing;
  }

  // ===== CERTIFICATIONS SECTION =====
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    checkPageBreak(sectionHeaderLineHeight + bodyLineHeight * resumeData.certifications.length);
    doc.setFontSize(sectionHeaderSize);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATIONS", margin, yPosition);
    yPosition += sectionHeaderLineHeight + subsectionSpacing;

    doc.setFontSize(bodySize);
    doc.setFont("helvetica", "normal");
    for (const cert of resumeData.certifications) {
      if (checkPageBreak(bodyLineHeight)) {
        yPosition = margin;
      }
      doc.text(`• ${cert}`, margin, yPosition);
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

