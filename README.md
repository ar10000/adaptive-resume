# Adaptive Resume

A Next.js 14 application for creating truth-locked, tailored resumes that match job descriptions while staying 100% accurate to your actual experience.

## Features

- **Truth-Locked Resume Tailoring**: AI-powered resume customization that matches job descriptions without fabricating qualifications
- **PDF & DOCX Support**: Upload and generate resumes in multiple formats
- **Modern UI**: Clean, professional interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: react-pdf, pdf-parse, jspdf
- **Document Generation**: docx
- **AI**: @anthropic-ai/sdk

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Anthropic Claude API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```
   - Get your API key from: https://console.anthropic.com/

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/app              # Next.js App Router routes
  /builder        # Resume builder page
/components       # React components
  /ui             # Reusable UI components
/lib              # Utilities and helpers
  /parser.ts      # PDF parsing with Claude API integration
  /pdf-parser.ts  # Legacy PDF parsing logic
  /resume-generator.ts # Resume generation logic
/types            # TypeScript type definitions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

### Core Functionality
- **PDF Parsing**: Extract structured data from PDF resumes using Claude API
- **Job Match Analysis**: Analyze how well your resume matches a job description
- **Resume Tailoring**: Generate tailored resumes that highlight relevant experience
- **Cover Letter Generation**: Create personalized cover letters
- **Interview Prep**: Generate interview preparation documents with STAR examples

### Truth-Locked System
- 🛡️ **Transparency Notice**: Clear indication that the tool only uses information from your resume
- **No Fabrication**: System never adds fake skills or experience
- **Diff View**: See exactly what changed between original and tailored resume
- **Validation**: Strict validation ensures no information is invented

### Additional Features
- **Sample Resume**: Try the tool with demo data
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Analytics**: Track match scores, missing skills, and generation success rates
- **Multiple Export Formats**: Download as PDF or DOCX
- **Real-time Preview**: See changes as you edit

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy!

## Security

- API keys are stored in environment variables
- Rate limiting prevents abuse
- Input validation on all API routes
- No sensitive data stored in client-side code

## Analytics

The application tracks:
- Average match scores
- Most common missing skills
- Generation success rates

Access analytics via `/api/analytics` endpoint (admin only in production).

## License

MIT
