# Adaptive Resume

A Next.js 14 application that uses AI to create truth-locked, tailored resumes that match job descriptions while maintaining 100% accuracy to your actual experience. This tool ensures you never fabricate qualifications while maximizing your resume's relevance to each job application.

## 🎯 Purpose

Adaptive Resume solves a critical problem in job searching: how to tailor your resume for each application without spending hours manually rewriting it, and without the ethical risk of fabricating skills or experience. The application uses advanced AI (Claude) to intelligently reframe your existing experience to highlight relevance to specific job descriptions, all while maintaining strict truth constraints.

## 🛡️ Core Philosophy: Truth-Locked System

The application is built on a fundamental principle: **never fabricate, always reframe**. Every feature is designed to work exclusively with information you've explicitly provided, ensuring:

- ✅ **No skill fabrication**: Skills not in your resume are never added
- ✅ **No experience invention**: Only your actual work history is used
- ✅ **Transparent changes**: See exactly what changed with diff views
- ✅ **Validation**: Strict checks prevent any information from being invented
- ✅ **Reframing focus**: Existing experience is rephrased to emphasize relevance

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern, responsive UI
- **PDF Rendering**: `react-pdf` for client-side PDF preview
- **UI Components**: Custom component library with reusable elements

### Backend & Processing
- **PDF Parsing**: `pdf-parse` for extracting text from uploaded resumes
- **PDF Generation**: `jspdf` for creating ATS-optimized PDF resumes
- **Document Generation**: `docx` for generating editable Word documents
- **AI Integration**: `@anthropic-ai/sdk` for Claude API integration

### AI & Intelligence
- **Claude 3.5 Sonnet**: Used for:
  - Resume parsing and structuring
  - Job description analysis
  - Resume tailoring with truth constraints
  - Cover letter generation
  - Interview preparation document creation

### Design System
- **Comprehensive Visual System**: Centralized design configuration ensuring consistent, professional output
- **Theme Presets**: Three visual styles (Classic ATS, Professional, Modern)
- **Visual QA**: Automated quality checks for typography, spacing, and consistency
- **ATS Optimization**: Design principles optimized for Applicant Tracking Systems

## ✨ Key Features

### Core Functionality
- **PDF Resume Upload**: Extract structured data from PDF resumes or LinkedIn profiles
- **Job Match Analysis**: Analyze how well your resume matches a job description with detailed scoring
- **Intelligent Tailoring**: Generate tailored resumes that highlight relevant experience
- **Cover Letter Generation**: Create personalized cover letters referencing specific resume achievements
- **Interview Prep**: Generate interview preparation documents with STAR method examples

### User Experience
- **Three-Step Wizard**: Intuitive workflow from upload to download
- **Real-Time Preview**: See changes as you edit with live PDF preview
- **Multiple View Modes**:
  - Edit & Preview: Side-by-side editing with live preview
  - Side-by-Side Comparison: Original vs. tailored resume
  - Before/After Slider: Interactive visual transformation
- **Diff View**: See exactly what changed between original and tailored versions
- **Theme Selection**: Choose from Classic ATS, Professional, or Modern visual styles

### Quality & Safety
- **Visual Quality Scoring**: Automated checks for design consistency (98/100+ scores)
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Input Validation**: Strict validation on all API routes
- **Error Handling**: Comprehensive error handling for malformed PDFs and API failures

### Export Options
- **PDF Export**: ATS-optimized PDF with embedded metadata
- **DOCX Export**: Editable Word documents with proper styling
- **Text Copy**: Copy resume as plain text to clipboard

## 📁 Architecture

### Application Structure
```
/app
  /api              # Next.js API routes (parse, analyze, generate, export)
  /builder          # Main resume builder interface
  /page.tsx         # Landing page

/components
  /ui               # Reusable UI components (Button, FileUpload, Spinner, etc.)
  ResumeEditor      # Editable resume form
  PDFPreview        # PDF preview with zoom and controls
  VisualComparison  # Side-by-side comparison view
  BeforeAfterSlider # Interactive before/after slider
  DiffView          # Change tracking component

/lib
  /design           # Visual design system and theme presets
  /qualityControl   # Visual QA and consistency checks
  /styles           # Legacy styling configuration
  parser.ts         # PDF parsing with Claude integration
  analyzer.ts        # Job description analysis
  generator.ts      # Resume tailoring with truth constraints
  exportPDF.ts      # PDF generation using design system
  exportDOCX.ts     # Word document generation
  coverLetter.ts    # Cover letter generation
  interviewPrep.ts  # Interview preparation generation
  claudeConfig.ts   # Claude API configuration
  rateLimit.ts      # Rate limiting implementation
  analytics.ts      # Analytics tracking

/types              # TypeScript type definitions
```

### Design System
The application uses a comprehensive design system (`lib/design/visualSystem.ts`) that defines:
- Color palettes and theming
- Typography (fonts, sizes, weights)
- Spacing and layout rules
- Section styling (headers, bullets, etc.)
- Visual elements (name cards, bullets, dividers)

This ensures every generated resume is visually consistent and professional.

## 🔒 Security & Privacy

- **Environment Variables**: All API keys stored in environment variables (never in code)
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Input Validation**: All user inputs are validated before processing
- **No Data Storage**: Resumes are processed in-memory and not stored permanently
- **Client-Side Processing**: PDF generation happens client-side when possible

## 📊 Analytics

The application tracks:
- Average match scores across all analyses
- Most common missing skills
- Generation success rates
- API usage patterns

## 🚀 Deployment

The application is designed for deployment on Vercel with:
- Serverless API routes for backend processing
- Edge-optimized static pages
- Environment variable configuration
- Automatic builds and deployments

## 🎨 Visual Design

The application features a modern, professional UI with:
- Clean, minimalist design
- Blue/gray color scheme
- Responsive layout for all screen sizes
- Loading states and error handling
- Smooth transitions and animations

## 📝 License

This software is proprietary and confidential. See [LICENSE](./LICENSE) for full terms.

---

**Note**: This repository is for demonstration purposes. The application requires API keys and environment configuration to run, which are not included in this repository.
