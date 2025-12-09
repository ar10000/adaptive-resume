// Resume data types
export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
  };
  summary?: string;
  workExperience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  skills: string[];
  certifications?: string[];
}

// Legacy interfaces (for backward compatibility)
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
}

// Job description types
export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  preferred?: string[];
}

// Resume generation options
export interface ResumeGenerationOptions {
  format: "pdf" | "docx";
  template?: string;
  includePhoto?: boolean;
}

// Job description analysis types
export interface MatchAnalysis {
  matchedSkills: string[];
  missingKeywords: string[];
  experienceAlignment: {
    strongMatches: string[];
    partialMatches: string[];
    gaps: string[];
  };
  overallScore: number; // 0-100
  bridgingStrategies: string[]; // Truthful suggestions based on adjacent skills
}
