import { DesignSystem } from "./visualSystem";

/**
 * Visual Theme Presets for Resume Generation
 * 
 * Three distinct visual styles optimized for different use cases:
 * - CLASSIC ATS: Maximum compatibility, minimal design
 * - PROFESSIONAL: Balanced design with subtle enhancements (RECOMMENDED)
 * - MODERN: Enhanced visual hierarchy for creative industries
 */

export type ThemePreset = "classic" | "professional" | "modern";

/**
 * Base design system (used as foundation for all presets)
 */
import DESIGN_SYSTEM_BASE from "./visualSystem";

/**
 * CLASSIC ATS Theme
 * Maximum compatibility, minimal design
 * Best for: Traditional industries, government, highly conservative roles
 */
export const CLASSIC_ATS_PRESET: Partial<DesignSystem> = {
  colors: {
    primary: "#000000", // Pure black
    accent: "#000000", // No accent color
    text: {
      primary: "#000000", // Pure black
      secondary: "#000000", // Pure black (no gray)
      light: "#000000", // Pure black
    },
    background: "#FFFFFF",
    divider: "#000000", // Black lines
    sectionBg: "#FFFFFF", // No background
  },
  typography: {
    fonts: {
      primary: "Arial, Helvetica, sans-serif", // More conservative font
      fallback: "Arial, Helvetica, sans-serif",
    },
    sizes: {
      name: 22, // Slightly smaller
      jobTitle: 12, // Standard size
      sectionHeader: 11, // Slightly smaller
      body: 10, // Standard ATS size
      contact: 10,
      date: 10,
    },
    weights: {
      name: "bold",
      sectionHeader: "bold",
      jobTitle: "bold", // Bold for emphasis
      company: "normal",
      body: "normal",
    },
  },
  spacing: {
    pageMargin: {
      top: 36, // Standard margins
      right: 36,
      bottom: 36,
      left: 36,
    },
    sectionGap: 12, // Tighter spacing
    jobGap: 10,
    bulletGap: 4,
    lineHeight: 1.2, // Tighter line height
    nameToContact: 2,
    contactToSummary: 12,
    headerToContent: 8,
  },
  sections: {
    header: {
      underline: {
        enabled: false, // No underlines
        thickness: 0,
        color: "#000000",
        gap: 0,
      },
      uppercase: true,
      letterSpacing: 0,
    },
  },
  elements: {
    bullet: {
      symbol: "•",
      color: "#000000",
      size: 10,
    },
    nameCard: {
      enabled: false, // No background card
      background: "#FFFFFF",
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      borderRadius: 0,
    },
  },
};

/**
 * PROFESSIONAL Theme (RECOMMENDED)
 * Balanced design with subtle enhancements
 * Best for: Most professional roles, tech, finance, consulting
 */
export const PROFESSIONAL_PRESET: Partial<DesignSystem> = {
  colors: {
    primary: "#4A5568", // Charcoal gray for headers
    accent: "#5B7FBA", // Professional blue
    text: {
      primary: "#2D3748", // Near-black for body
      secondary: "#718096", // Gray for dates/location
      light: "#A0AEC0", // Light gray for subtle text
    },
    background: "#FFFFFF",
    divider: "#E2E8F0", // Soft gray for lines
    sectionBg: "#F7FAFC", // Very subtle background for sections
  },
  typography: {
    fonts: {
      primary: "Calibri, Arial, sans-serif",
      fallback: "Arial, Helvetica, sans-serif",
    },
    sizes: {
      name: 24, // Larger, bold
      jobTitle: 13, // Company role size
      sectionHeader: 12, // UPPERCASE headers
      body: 11, // Standard bullet text
      contact: 10, // Email, phone, etc.
      date: 10, // Right-aligned dates
    },
    weights: {
      name: "bold",
      sectionHeader: "bold",
      jobTitle: "600", // Semi-bold
      company: "normal",
      body: "normal",
    },
  },
  spacing: {
    pageMargin: {
      top: 40,
      right: 45,
      bottom: 40,
      left: 45,
    },
    sectionGap: 12, // Reduced to prevent double spacing with headerToContent
    jobGap: 14,
    bulletGap: 6,
    lineHeight: 1.4,
    nameToContact: 4,
    contactToSummary: 16,
    headerToContent: 10,
  },
  sections: {
    header: {
      underline: {
        enabled: true, // Subtle underlines
        thickness: 1,
        color: "#E2E8F0",
        gap: 6,
      },
      uppercase: true,
      letterSpacing: 0.5,
    },
  },
  elements: {
    bullet: {
      symbol: "•",
      color: "#4A5568",
      size: 11,
    },
    nameCard: {
      enabled: true, // Subtle background
      background: "#F7FAFC",
      padding: {
        top: 16,
        bottom: 16,
        left: 20,
        right: 20,
      },
      borderRadius: 0,
    },
  },
};

/**
 * MODERN Theme
 * Enhanced visual hierarchy for creative industries
 * Best for: Design, marketing, creative roles, startups
 */
export const MODERN_PRESET: Partial<DesignSystem> = {
  colors: {
    primary: "#2D3748", // Darker gray
    accent: "#4299E1", // Brighter blue
    text: {
      primary: "#1A202C", // Very dark
      secondary: "#4A5568", // Medium gray
      light: "#718096", // Light gray
    },
    background: "#FFFFFF",
    divider: "#CBD5E0", // Slightly darker divider
    sectionBg: "#EDF2F7", // More visible background
  },
  typography: {
    fonts: {
      primary: "Calibri, Arial, sans-serif",
      fallback: "Arial, Helvetica, sans-serif",
    },
    sizes: {
      name: 26, // Larger name
      jobTitle: 14, // Slightly larger
      sectionHeader: 13, // Larger headers
      body: 11,
      contact: 10,
      date: 10,
    },
    weights: {
      name: "bold",
      sectionHeader: "bold",
      jobTitle: "600",
      company: "normal",
      body: "normal",
    },
  },
  spacing: {
    pageMargin: {
      top: 36,
      right: 40,
      bottom: 36,
      left: 40,
    },
    sectionGap: 20, // More spacing
    jobGap: 16,
    bulletGap: 8,
    lineHeight: 1.5, // More breathing room
    nameToContact: 6,
    contactToSummary: 18,
    headerToContent: 12,
  },
  sections: {
    header: {
      underline: {
        enabled: true,
        thickness: 2, // Thicker underline
        color: "#CBD5E0",
        gap: 8,
      },
      uppercase: true,
      letterSpacing: 1, // More letter spacing
    },
  },
  elements: {
    bullet: {
      symbol: "•",
      color: "#4299E1", // Accent color for bullets
      size: 12,
    },
    nameCard: {
      enabled: true,
      background: "#EDF2F7", // More visible background
      padding: {
        top: 20,
        bottom: 20,
        left: 24,
        right: 24,
      },
      borderRadius: 4, // Slight rounding
    },
  },
};

/**
 * Get design system with preset applied
 */
export function getDesignSystemWithPreset(
  preset: ThemePreset = "professional"
): DesignSystem {
  const base = DESIGN_SYSTEM_BASE;
  let presetConfig: Partial<DesignSystem>;

  switch (preset) {
    case "classic":
      presetConfig = CLASSIC_ATS_PRESET;
      break;
    case "modern":
      presetConfig = MODERN_PRESET;
      break;
    case "professional":
    default:
      presetConfig = PROFESSIONAL_PRESET;
      break;
  }

  // Deep merge preset with base
  return {
    colors: { ...base.colors, ...presetConfig.colors },
    typography: {
      ...base.typography,
      ...presetConfig.typography,
      fonts: {
        ...base.typography.fonts,
        ...(presetConfig.typography?.fonts || {}),
      },
      sizes: {
        ...base.typography.sizes,
        ...(presetConfig.typography?.sizes || {}),
      },
      weights: {
        ...base.typography.weights,
        ...(presetConfig.typography?.weights || {}),
      },
    },
    spacing: {
      ...base.spacing,
      ...presetConfig.spacing,
      pageMargin: {
        ...base.spacing.pageMargin,
        ...(presetConfig.spacing?.pageMargin || {}),
      },
    },
    layout: { ...base.layout, ...presetConfig.layout },
    sections: {
      ...base.sections,
      ...presetConfig.sections,
      header: {
        ...base.sections.header,
        ...(presetConfig.sections?.header || {}),
        underline: {
          ...base.sections.header.underline,
          ...(presetConfig.sections?.header?.underline || {}),
        },
      },
    },
    elements: {
      ...base.elements,
      ...presetConfig.elements,
      bullet: {
        ...base.elements.bullet,
        ...(presetConfig.elements?.bullet || {}),
      },
      nameCard: {
        ...base.elements.nameCard,
        ...(presetConfig.elements?.nameCard || {}),
        padding: {
          ...base.elements.nameCard.padding,
          ...(presetConfig.elements?.nameCard?.padding || {}),
        },
      },
    },
  } as DesignSystem;
}

/**
 * Get preset description
 */
export function getPresetDescription(preset: ThemePreset): string {
  switch (preset) {
    case "classic":
      return "Maximum ATS compatibility with minimal design. Best for traditional industries.";
    case "modern":
      return "Enhanced visual hierarchy for creative industries. Still ATS-compatible.";
    case "professional":
    default:
      return "Balanced design with subtle enhancements. Recommended for most roles.";
  }
}

/**
 * Get preset display name
 */
export function getPresetDisplayName(preset: ThemePreset): string {
  switch (preset) {
    case "classic":
      return "Classic ATS";
    case "modern":
      return "Modern";
    case "professional":
    default:
      return "Professional";
  }
}

