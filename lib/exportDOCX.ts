import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BorderStyle,
  WidthType,
  LevelFormat,
  convertInchesToTwip,
} from "docx";
import { ResumeData } from "@/types";
import resumeStyles, {
  formatSectionHeader,
  formatDate,
  formatContactInfo,
  getBulletCharacter,
} from "./styles/resumeStyles";

/**
 * Generates a professionally styled, ATS-optimized Word document resume
 * Uses comprehensive styling system with proper Word styles for maximum compatibility
 * @param resumeData - The resume data to export
 * @returns Blob containing the DOCX file
 */
export async function exportResumeToDOCX(resumeData: ResumeData): Promise<Blob> {
  const children: Paragraph[] = [];

  // ===== DOCUMENT STYLES =====
  const styles = {
    paragraphStyles: [
      // Resume Name Style
      {
        id: "resumeName",
        name: "Resume Name",
        basedOn: "Normal",
        run: {
          size: 36, // 18pt (half-points: 18 * 2 = 36)
          bold: true,
          font: resumeStyles.fonts.primary.family,
          color: resumeStyles.colors.primary.text.replace("#", ""),
        },
        paragraph: {
          alignment:
            resumeStyles.layout.nameAlignment === "center"
              ? AlignmentType.CENTER
              : AlignmentType.LEFT,
          spacing: {
            after: 120, // 6pt spacing after name
          },
        },
      },
      // Contact Info Style
      {
        id: "contactInfo",
        name: "Contact Info",
        basedOn: "Normal",
        run: {
          size: 20, // 10pt
          font: resumeStyles.fonts.primary.family,
          color: "555555", // Gray color
        },
        paragraph: {
          alignment:
            resumeStyles.layout.contactAlignment === "center"
              ? AlignmentType.CENTER
              : AlignmentType.LEFT,
          spacing: {
            after: 280, // 14pt spacing after contact (section spacing)
          },
        },
      },
      // Section Header Style
      {
        id: "sectionHeader",
        name: "Section Header",
        basedOn: "Normal",
        run: {
          size: 24, // 12pt
          bold: true,
          allCaps: true,
          font: resumeStyles.fonts.primary.family,
          color: resumeStyles.colors.primary.text.replace("#", ""),
        },
        paragraph: {
          spacing: {
            before: 320, // 16pt before (sectionHeaderAbove)
            after: 160, // 8pt after (sectionHeaderBelow)
          },
          border: resumeStyles.sections.headers.underline
            ? {
                bottom: {
                  color: "C8C8C8", // RGB(200,200,200) in hex
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6, // 1pt
                },
              }
            : undefined,
        },
      },
      // Job Title Style
      {
        id: "jobTitle",
        name: "Job Title",
        basedOn: "Normal",
        run: {
          size: 22, // 11pt
          bold: true,
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing
          },
        },
      },
      // Company Name Style
      {
        id: "companyName",
        name: "Company Name",
        basedOn: "Normal",
        run: {
          size: 22, // 11pt
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing
          },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
            },
          ],
        },
      },
      // Date Style
      {
        id: "dateRange",
        name: "Date Range",
        basedOn: "Normal",
        run: {
          size: 22, // 11pt
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          alignment: AlignmentType.RIGHT,
          spacing: {
            after: 40, // 2pt spacing
          },
        },
      },
      // Bullet Point Style
      {
        id: "bulletPoint",
        name: "Bullet Point",
        basedOn: "Normal",
        run: {
          size: 20, // 10pt
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing between bullets
            line: 288, // 1.2 line height (240 * 1.2 = 288)
          },
          indent: {
            left: convertInchesToTwip(resumeStyles.spacing.bulletIndent), // 0.25 inch
            hanging: convertInchesToTwip(resumeStyles.spacing.bulletIndent), // Hanging indent
          },
        },
      },
      // Body Text Style
      {
        id: "bodyText",
        name: "Body Text",
        basedOn: "Normal",
        run: {
          size: 22, // 11pt
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 180, // 9pt spacing (betweenJobs)
          },
        },
      },
      // Education Degree Style
      {
        id: "educationDegree",
        name: "Education Degree",
        basedOn: "Normal",
        run: {
          size: 22, // 11pt
          bold: true,
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing
          },
        },
      },
      // Skills Category Style
      {
        id: "skillsCategory",
        name: "Skills Category",
        basedOn: "Normal",
        run: {
          size: 20, // 10pt
          bold: true,
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing
          },
        },
      },
      // Skills List Style
      {
        id: "skillsList",
        name: "Skills List",
        basedOn: "Normal",
        run: {
          size: 20, // 10pt
          font: resumeStyles.fonts.primary.family,
        },
        paragraph: {
          spacing: {
            after: 40, // 2pt spacing
          },
        },
      },
    ],
  };

  // ===== HEADER SECTION =====
  // Name
  children.push(
    new Paragraph({
      text: resumeData.personalInfo.name,
      style: "resumeName",
    })
  );

  // Contact Information
  const contactLines = formatContactInfo(
    resumeData.personalInfo,
    resumeStyles.contact.format
  );

  for (const line of contactLines) {
    if (line === resumeData.personalInfo.name) continue; // Skip name, already printed

    children.push(
      new Paragraph({
        text: line,
        style: "contactInfo",
      })
    );
  }

  // ===== SUMMARY SECTION =====
  if (resumeData.summary) {
    children.push(
      new Paragraph({
        text: formatSectionHeader("PROFESSIONAL SUMMARY"),
        style: "sectionHeader",
      })
    );

    children.push(
      new Paragraph({
        text: resumeData.summary,
        style: "bodyText",
      })
    );
  }

  // ===== WORK EXPERIENCE SECTION =====
  if (resumeData.workExperience.length > 0) {
    children.push(
      new Paragraph({
        text: formatSectionHeader("WORK EXPERIENCE"),
        style: "sectionHeader",
      })
    );

    for (let i = 0; i < resumeData.workExperience.length; i++) {
      const exp = resumeData.workExperience[i];
      const isLastJob = i === resumeData.workExperience.length - 1;

      // Job Title
      children.push(
        new Paragraph({
          text: exp.title,
          style: "jobTitle",
        })
      );

      // Company Name and Date Range on same line (using tabs)
      const dateRange = formatDate(exp.startDate, exp.endDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company,
              style: "companyName",
            }),
            new TextRun({
              text: `\t${dateRange}`, // Tab to push date to right
            }),
          ],
          style: "companyName",
        })
      );

      // Bullet Points
      const bulletChar = getBulletCharacter();
      const maxBullets = resumeStyles.workExperience.bullets.maxPerRole;
      const bulletsToShow = exp.bullets.slice(0, maxBullets);

      for (const bullet of bulletsToShow) {
        // Remove [LESS_RELEVANT] marker if present
        const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
        if (!displayBullet) continue;

        children.push(
          new Paragraph({
            text: `${bulletChar} ${displayBullet}`,
            style: "bulletPoint",
          })
        );
      }

      // Add spacing between jobs (except after last job)
      if (!isLastJob) {
        children.push(
          new Paragraph({
            text: "",
            spacing: {
              after: 180, // 9pt spacing (betweenJobs)
            },
          })
        );
      }
    }
  }

  // ===== EDUCATION SECTION =====
  if (resumeData.education.length > 0) {
    children.push(
      new Paragraph({
        text: formatSectionHeader("EDUCATION"),
        style: "sectionHeader",
      })
    );

    for (const edu of resumeData.education) {
      // Degree and Field (bold)
      children.push(
        new Paragraph({
          text: `${edu.degree} in ${edu.field}`,
          style: "educationDegree",
        })
      );

      // Institution and Date
      children.push(
        new Paragraph({
          text: `${edu.institution} | ${edu.graduationDate}`,
          style: "bodyText",
        })
      );
    }
  }

  // ===== SKILLS SECTION =====
  if (resumeData.skills.length > 0) {
    children.push(
      new Paragraph({
        text: formatSectionHeader("SKILLS"),
        style: "sectionHeader",
      })
    );

    // Format skills based on config
    if (
      resumeStyles.skills.format === "categorized" &&
      resumeData.skills.length > resumeStyles.skills.maxForCommaSeparated
    ) {
      // Categorized format
      // For now, use a simple categorization (could be enhanced with AI)
      // Group skills into common categories
      const categorized: Record<string, string[]> = {
        Technical: [],
        "Tools & Platforms": [],
        "Core Competencies": [],
      };

      // Simple categorization logic (can be enhanced)
      resumeData.skills.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        if (
          skillLower.includes("api") ||
          skillLower.includes("framework") ||
          skillLower.includes("language") ||
          skillLower.includes("python") ||
          skillLower.includes("javascript") ||
          skillLower.includes("typescript") ||
          skillLower.includes("react") ||
          skillLower.includes("node")
        ) {
          categorized.Technical.push(skill);
        } else if (
          skillLower.includes("git") ||
          skillLower.includes("make") ||
          skillLower.includes("supabase") ||
          skillLower.includes("firebase") ||
          skillLower.includes("platform")
        ) {
          categorized["Tools & Platforms"].push(skill);
        } else {
          categorized["Core Competencies"].push(skill);
        }
      });

      // Add categorized skills
      Object.entries(categorized).forEach(([category, skills]) => {
        if (skills.length > 0) {
          children.push(
            new Paragraph({
              text: category,
              style: "skillsCategory",
            })
          );

          children.push(
            new Paragraph({
              text: skills.join(", "),
              style: "skillsList",
            })
          );
        }
      });
    } else {
      // Comma-separated format
      children.push(
        new Paragraph({
          text: resumeData.skills.join(", "),
          style: "skillsList",
        })
      );
    }
  }

  // ===== CERTIFICATIONS SECTION =====
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: formatSectionHeader("CERTIFICATIONS"),
        style: "sectionHeader",
      })
    );

    const bulletChar = getBulletCharacter();
    for (const cert of resumeData.certifications) {
      children.push(
        new Paragraph({
          text: `${bulletChar} ${cert}`,
          style: "bulletPoint",
        })
      );
    }
  }

  // ===== CREATE DOCUMENT =====
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: "portrait",
              width: convertInchesToTwip(8.5), // 8.5 inches
              height: convertInchesToTwip(11), // 11 inches
            },
            margins: {
              top: convertInchesToTwip(resumeStyles.margins.top),
              right: convertInchesToTwip(resumeStyles.margins.right),
              bottom: convertInchesToTwip(resumeStyles.margins.bottom),
              left: convertInchesToTwip(resumeStyles.margins.left),
            },
          },
        },
        children,
      },
    ],
    styles,
  });

  // Generate buffer and return as blob
  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Generates a DOCX resume and returns it as a data URL for preview
 * Note: Browsers cannot preview DOCX files directly, so this is mainly for download
 * @param resumeData - The resume data to export
 * @returns Data URL string for the DOCX (or blob URL)
 */
export async function exportResumeToDOCXDataURL(
  resumeData: ResumeData
): Promise<string> {
  const blob = await exportResumeToDOCX(resumeData);
  return URL.createObjectURL(blob);
}
