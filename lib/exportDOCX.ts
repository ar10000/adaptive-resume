import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  SectionType,
} from "docx";
import { ResumeData } from "@/types";

/**
 * Generates a clean, ATS-friendly Word document from ResumeData
 * @param resumeData - The resume data to export
 * @returns Blob containing the DOCX file
 */
export async function exportResumeToDOCX(resumeData: ResumeData): Promise<Blob> {
  const children: Paragraph[] = [];

  // ===== HEADER SECTION =====
  // Name (Heading 1 style, centered)
  children.push(
    new Paragraph({
      text: resumeData.personalInfo.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 120, // 6pt spacing
      },
    })
  );

  // Contact Information (Normal text, centered)
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

  if (contactInfo.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(" | "),
            size: 22, // 11pt
            color: "000000",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 240, // 12pt spacing
        },
      })
    );
  }

  // ===== SUMMARY SECTION =====
  if (resumeData.summary) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "SUMMARY",
            bold: true,
            size: 24, // 12pt
            color: "000000",
            allCaps: true,
          }),
        ],
        spacing: {
          before: 240, // 12pt spacing before
          after: 120, // 6pt spacing after
        },
      })
    );

    // Summary text
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.summary,
            size: 20, // 10pt
            color: "000000",
          }),
        ],
        spacing: {
          after: 240, // 12pt spacing
        },
      })
    );
  }

  // ===== WORK EXPERIENCE SECTION =====
  if (resumeData.workExperience.length > 0) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "WORK EXPERIENCE",
            bold: true,
            size: 24, // 12pt
            color: "000000",
            allCaps: true,
          }),
        ],
        spacing: {
          before: 240, // 12pt spacing before
          after: 120, // 6pt spacing after
        },
      })
    );

    // Work Experience entries
    for (const exp of resumeData.workExperience) {
      // Job Title and Company (Bold)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.title} | ${exp.company}`,
              bold: true,
              size: 20, // 10pt
              color: "000000",
            }),
          ],
          spacing: {
            before: 120, // 6pt spacing before first entry
            after: 60, // 3pt spacing after
          },
        })
      );

      // Date Range (Normal)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.startDate} - ${exp.endDate}`,
              size: 20, // 10pt
              color: "000000",
            }),
          ],
          spacing: {
            after: 60, // 3pt spacing
          },
        })
      );

      // Bullet Points
      for (const bullet of exp.bullets) {
        // Remove [LESS_RELEVANT] marker if present
        const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
        if (!displayBullet) continue;

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "• ",
                size: 20, // 10pt
                color: "000000",
              }),
              new TextRun({
                text: displayBullet,
                size: 20, // 10pt
                color: "000000",
              }),
            ],
            indent: {
              left: 360, // 0.25" indent for bullets
            },
            spacing: {
              after: 60, // 3pt spacing
            },
          })
        );
      }
    }
  }

  // ===== EDUCATION SECTION =====
  if (resumeData.education.length > 0) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EDUCATION",
            bold: true,
            size: 24, // 12pt
            color: "000000",
            allCaps: true,
          }),
        ],
        spacing: {
          before: 240, // 12pt spacing before
          after: 120, // 6pt spacing after
        },
      })
    );

    // Education entries
    for (const edu of resumeData.education) {
      // Degree and Field (Bold)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 20, // 10pt
              color: "000000",
            }),
          ],
          spacing: {
            before: 120, // 6pt spacing before first entry
            after: 60, // 3pt spacing after
          },
        })
      );

      // Institution and Date (Normal)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${edu.institution} | ${edu.graduationDate}`,
              size: 20, // 10pt
              color: "000000",
            }),
          ],
          spacing: {
            after: 120, // 6pt spacing
          },
        })
      );
    }
  }

  // ===== SKILLS SECTION =====
  if (resumeData.skills.length > 0) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "SKILLS",
            bold: true,
            size: 24, // 12pt
            color: "000000",
            allCaps: true,
          }),
        ],
        spacing: {
          before: 240, // 12pt spacing before
          after: 120, // 6pt spacing after
        },
      })
    );

    // Skills text (comma-separated)
    const skillsText = resumeData.skills.join(", ");
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: skillsText,
            size: 20, // 10pt
            color: "000000",
          }),
        ],
        spacing: {
          after: 240, // 12pt spacing
        },
      })
    );
  }

  // ===== CERTIFICATIONS SECTION =====
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    // Section Header
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "CERTIFICATIONS",
            bold: true,
            size: 24, // 12pt
            color: "000000",
            allCaps: true,
          }),
        ],
        spacing: {
          before: 240, // 12pt spacing before
          after: 120, // 6pt spacing after
        },
      })
    );

    // Certification entries
    for (const cert of resumeData.certifications) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "• ",
              size: 20, // 10pt
              color: "000000",
            }),
            new TextRun({
              text: cert,
              size: 20, // 10pt
              color: "000000",
            }),
          ],
          indent: {
            left: 360, // 0.25" indent for bullets
          },
          spacing: {
            after: 60, // 3pt spacing
          },
        })
      );
    }
  }

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5" top margin (in twips: 1" = 1440 twips)
              right: 720, // 0.5" right margin
              bottom: 720, // 0.5" bottom margin
              left: 720, // 0.5" left margin
            },
          },
        },
        children: children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri", // ATS-friendly font
            size: 20, // 10pt default
            color: "000000",
          },
          paragraph: {
            spacing: {
              line: 240, // 12pt line spacing
              lineRule: "auto",
            },
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 32, // 16pt
            bold: true,
            color: "000000",
          },
          paragraph: {
            spacing: {
              after: 120, // 6pt spacing
            },
          },
        },
      },
    },
  });

  // Generate the blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

