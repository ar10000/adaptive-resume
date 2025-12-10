/**
 * Comprehensive Visual Design System for Resume Generation
 * 
 * CRITICAL: This system must produce IDENTICAL output every time. No variations.
 * All values are fixed and deterministic to ensure consistent resume formatting.
 */

export interface DesignSystem {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  layout: LayoutRules;
  sections: SectionStyling;
  elements: VisualElements;
}

export interface ColorPalette {
  primary: string; // Charcoal gray for headers
  accent: string; // Professional blue
  text: {
    primary: string; // Near-black for body
    secondary: string; // Gray for dates/location
    light: string; // Light gray for subtle text
  };
  background: string;
  divider: string; // Soft gray for lines
  sectionBg: string; // Very subtle background for sections
}

export interface TypographySystem {
  fonts: {
    primary: string;
    fallback: string;
  };
  sizes: {
    name: number; // Larger, bold
    jobTitle: number; // Company role size
    sectionHeader: number; // UPPERCASE headers
    body: number; // Standard bullet text
    contact: number; // Email, phone, etc.
    date: number; // Right-aligned dates
  };
  weights: {
    name: string;
    sectionHeader: string;
    jobTitle: string; // Semi-bold
    company: string;
    body: string;
  };
}

export interface SpacingSystem {
  pageMargin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  sectionGap: number; // Between major sections
  jobGap: number; // Between different jobs
  bulletGap: number; // Between bullets
  lineHeight: number; // Text line height
  nameToContact: number; // Name to contact info
  contactToSummary: number; // Contact to first section
  headerToContent: number; // Section header to content
}

export interface LayoutRules {
  maxWidth: number; // Letter size width (8.5")
  contentWidth: number; // Width minus margins
  bulletIndent: number; // Left indent for bullets
  dateAlign: "left" | "right" | "center";
  textAlign: "left" | "right" | "center";
}

export interface SectionStyling {
  header: {
    underline: {
      enabled: boolean;
      thickness: number;
      color: string;
      gap: number; // Space between text and line
    };
    uppercase: boolean;
    letterSpacing: number;
  };
}

export interface VisualElements {
  bullet: {
    symbol: string;
    color: string;
    size: number;
  };
  nameCard: {
    enabled: boolean;
    background: string;
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    borderRadius: number;
  };
}

/**
 * Main Design System Configuration
 * 
 * This system ensures IDENTICAL output every time by using fixed values.
 * All measurements are in points (pt) for consistency across PDF and DOCX exports.
 */
const DESIGN_SYSTEM: DesignSystem = {
  // COLOR PALETTE (Professional + Modern)
  colors: {
    primary: "#4A5568", // Charcoal gray for headers
    accent: "#5B7FBA", // Professional blue (similar to template)
    text: {
      primary: "#2D3748", // Near-black for body
      secondary: "#718096", // Gray for dates/location
      light: "#A0AEC0", // Light gray for subtle text
    },
    background: "#FFFFFF",
    divider: "#E2E8F0", // Soft gray for lines
    sectionBg: "#F7FAFC", // Very subtle background for sections
  },

  // TYPOGRAPHY (Exact specifications)
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

  // SPACING (Consistent throughout)
  spacing: {
    // Page margins (in points)
    pageMargin: {
      top: 40,
      right: 45,
      bottom: 40,
      left: 45,
    },

    // Between major sections
    sectionGap: 18,

    // Within sections
    jobGap: 14, // Between different jobs
    bulletGap: 6, // Between bullets
    lineHeight: 1.4, // Text line height

    // Special spacing
    nameToContact: 4, // Name to contact info
    contactToSummary: 16, // Contact to first section
    headerToContent: 10, // Section header to content
  },

  // LAYOUT RULES
  layout: {
    maxWidth: 612, // Letter size width (8.5" in points: 8.5 * 72 = 612)
    contentWidth: 522, // Width minus margins (612 - 45 - 45 = 522)
    bulletIndent: 20, // Left indent for bullets
    dateAlign: "right", // Always right-align dates
    textAlign: "left", // Body text alignment
  },

  // SECTION STYLING
  sections: {
    header: {
      // Thin line under section headers
      underline: {
        enabled: true,
        thickness: 1,
        color: "#E2E8F0",
        gap: 6, // Space between text and line
      },
      uppercase: true,
      letterSpacing: 0.5,
    },
  },

  // VISUAL ELEMENTS
  elements: {
    bullet: {
      symbol: "•",
      color: "#4A5568",
      size: 11,
    },

    // Optional: Subtle background for name section
    nameCard: {
      enabled: true,
      background: "#F7FAFC",
      padding: {
        top: 16,
        bottom: 16,
        left: 20,
        right: 20,
      },
      borderRadius: 0, // Keep it professional
    },
  },
};

/**
 * Helper functions for consistent design system usage
 */

/**
 * Get font family string with fallbacks
 */
export function getFontFamily(): string {
  return DESIGN_SYSTEM.typography.fonts.primary;
}

/**
 * Get font size in points
 */
export function getFontSize(type: keyof DesignSystem["typography"]["sizes"]): number {
  return DESIGN_SYSTEM.typography.sizes[type];
}

/**
 * Get font weight
 */
export function getFontWeight(type: keyof DesignSystem["typography"]["weights"]): string {
  return DESIGN_SYSTEM.typography.weights[type];
}

/**
 * Get color value
 */
export function getColor(
  category: keyof DesignSystem["colors"],
  variant?: keyof DesignSystem["colors"]["text"]
): string {
  if (category === "text" && variant) {
    return DESIGN_SYSTEM.colors.text[variant];
  }
  return DESIGN_SYSTEM.colors[category] as string;
}

/**
 * Get spacing value
 */
export function getSpacing(
  category: keyof DesignSystem["spacing"],
  variant?: keyof DesignSystem["spacing"]["pageMargin"]
): number {
  if (category === "pageMargin" && variant) {
    return DESIGN_SYSTEM.spacing.pageMargin[variant];
  }
  return DESIGN_SYSTEM.spacing[category] as number;
}

/**
 * Convert hex color to RGB array for jsPDF
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

/**
 * Convert hex color to RGB string for docx
 */
export function hexToRgbString(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgb.map((n) => n.toString(16).padStart(2, "0")).join("");
}

/**
 * Format section header text (uppercase with letter spacing)
 */
export function formatSectionHeader(text: string): string {
  if (DESIGN_SYSTEM.sections.header.uppercase) {
    return text.toUpperCase();
  }
  return text;
}

/**
 * Get bullet symbol
 */
export function getBulletSymbol(): string {
  return DESIGN_SYSTEM.elements.bullet.symbol;
}

/**
 * Calculate line height from font size
 */
export function calculateLineHeight(fontSize: number): number {
  return fontSize * DESIGN_SYSTEM.spacing.lineHeight;
}

/**
 * Validate design system consistency
 */
export function validateDesignSystem(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate colors are valid hex codes
  const colorValues = [
    DESIGN_SYSTEM.colors.primary,
    DESIGN_SYSTEM.colors.accent,
    DESIGN_SYSTEM.colors.background,
    DESIGN_SYSTEM.colors.divider,
    DESIGN_SYSTEM.colors.sectionBg,
    DESIGN_SYSTEM.colors.text.primary,
    DESIGN_SYSTEM.colors.text.secondary,
    DESIGN_SYSTEM.colors.text.light,
  ];

  colorValues.forEach((color, index) => {
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      errors.push(`Invalid color format at index ${index}: ${color}`);
    }
  });

  // Validate font sizes are positive
  Object.entries(DESIGN_SYSTEM.typography.sizes).forEach(([key, value]) => {
    if (value <= 0) {
      errors.push(`Invalid font size for ${key}: ${value}`);
    }
  });

  // Validate spacing values are non-negative
  Object.entries(DESIGN_SYSTEM.spacing).forEach(([key, value]) => {
    if (typeof value === "number" && value < 0) {
      errors.push(`Invalid spacing for ${key}: ${value}`);
    } else if (typeof value === "object" && value !== null && "top" in value) {
      // pageMargin object
      Object.entries(value).forEach(([marginKey, marginValue]) => {
        if (typeof marginValue === "number" && marginValue < 0) {
          errors.push(`Invalid page margin ${marginKey}: ${marginValue}`);
        }
      });
    }
  });

  // Validate layout dimensions
  if (DESIGN_SYSTEM.layout.maxWidth <= 0) {
    errors.push(`Invalid maxWidth: ${DESIGN_SYSTEM.layout.maxWidth}`);
  }
  if (DESIGN_SYSTEM.layout.contentWidth <= 0) {
    errors.push(`Invalid contentWidth: ${DESIGN_SYSTEM.layout.contentWidth}`);
  }
  if (DESIGN_SYSTEM.layout.contentWidth > DESIGN_SYSTEM.layout.maxWidth) {
    errors.push(
      `contentWidth (${DESIGN_SYSTEM.layout.contentWidth}) cannot be greater than maxWidth (${DESIGN_SYSTEM.layout.maxWidth})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export the design system as default
export default DESIGN_SYSTEM;

// Export type for use in other files
export type { DesignSystem };

