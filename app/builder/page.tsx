"use client";

import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import Spinner from "@/components/ui/Spinner";
import MatchAnalysis from "@/components/ui/MatchAnalysis";
import ResumeEditor from "@/components/ResumeEditor";
import PDFPreview from "@/components/PDFPreview";
import { ResumeData, MatchAnalysis as MatchAnalysisType } from "@/types";
import Button from "@/components/ui/Button";
import DiffView from "@/components/DiffView";
import { sampleResumeData } from "@/lib/demoData";

type Step = 1 | 2 | 3;

export default function BuilderPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [originalResumeData, setOriginalResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysisType | null>(null);
  // PDF preview is now handled by PDFPreview component
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">("resume");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  // Loading states
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Step 1: Handle file upload and parsing
  const handleFileSelect = async (file: File) => {
    setParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse PDF");
      }

      const data = await response.json();
      setResumeData(data.resumeData);
      setOriginalResumeData(data.resumeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF");
    } finally {
      setParsing(false);
    }
  };

  // Step 2: Analyze job match
  const handleAnalyze = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError("Please provide both resume data and job description");
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze job match");
      }

      const data = await response.json();
      setMatchAnalysis(data.matchAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze job match");
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Generate tailored resume
  const handleGenerate = async () => {
    if (!originalResumeData || !jobDescription || !matchAnalysis) {
      setError("Missing required data for generation");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalResumeData,
          jobDescription,
          matchAnalysis,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate tailored resume");
      }

      const data = await response.json();
      // Keep original resume data for diff view
      if (!originalResumeData) {
        setOriginalResumeData(resumeData);
      }
      setResumeData(data.tailoredResume);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate tailored resume");
    } finally {
      setGenerating(false);
    }
  };

  // Step 3: Download PDF
  const handleDownloadPDF = async () => {
    if (!resumeData) {
      setError("No resume data available");
      return;
    }

    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    }
  };

  // Generate PDF preview
  const generatePDFPreview = async (data: ResumeData) => {
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeData: data }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF preview");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error generating PDF preview:", err);
      // Don't set error state for preview failures
    }
  };

  // Update PDF preview when resume data changes in step 3
  const handleResumeUpdate = (updatedData: ResumeData) => {
    setResumeData(updatedData);
    // Optionally regenerate preview on update (debounced in real app)
    // generatePDFPreview(updatedData);
  };

  // Generate cover letter
  const handleGenerateCoverLetter = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError("Resume data and job description are required");
      return;
    }

    setGeneratingCoverLetter(true);
    setError(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  // Step 3: Download DOCX
  const handleDownloadDOCX = async () => {
    if (!resumeData) {
      setError("No resume data available");
      return;
    }

    try {
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate DOCX");
      }

      // Get the DOCX blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download DOCX");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Transparency Notice */}
        <div className="mb-6 rounded-lg border-l-4 border-primary-500 bg-primary-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-primary-800">
                Truth-Locked: This tool only uses information from your resume. It will never add fake skills or experience.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="mt-2 text-gray-600">
            Create a tailored resume for your target job
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-1 items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 flex-1 ${
                        currentStep > step ? "bg-primary-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className={currentStep >= 1 ? "text-primary-600" : "text-gray-400"}>
              Upload Resume
            </span>
            <span className={currentStep >= 2 ? "text-primary-600" : "text-gray-400"}>
              Analyze Match
            </span>
            <span className={currentStep >= 3 ? "text-primary-600" : "text-gray-400"}>
              Review & Download
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Upload Resume */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Your Resume
                </h2>
                <button
                  onClick={() => {
                    setResumeData(sampleResumeData);
                    setOriginalResumeData(sampleResumeData);
                    setError(null);
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Try Sample Resume
                </button>
              </div>
              <FileUpload onFileSelect={handleFileSelect} />
              {parsing && (
                <div className="mt-4 flex items-center gap-3">
                  <Spinner />
                  <span className="text-gray-600">Parsing PDF...</span>
                </div>
              )}
            </div>

            {resumeData && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Extracted Resume Data
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Name</h3>
                    <p className="text-gray-900">{resumeData.personalInfo.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Email</h3>
                    <p className="text-gray-900">{resumeData.personalInfo.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Work Experience</h3>
                    <p className="text-gray-600">
                      {resumeData.workExperience.length} position(s)
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Skills</h3>
                    <p className="text-gray-600">{resumeData.skills.length} skill(s)</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="primary"
                    className="w-full"
                  >
                    Next: Add Job Description
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Job Description & Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Job Description
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={12}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <div className="mt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing || !jobDescription.trim()}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <>
                        <Spinner className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Match"
                    )}
                  </button>
              </div>
            </div>

            {matchAnalysis && (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  Match Analysis
                </h2>
                <MatchAnalysis analysis={matchAnalysis} />
                <div className="mt-6">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <Spinner className="mr-2" />
                        Generating Tailored Resume...
                      </>
                    ) : (
                      "Generate Tailored Resume"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Download */}
        {currentStep === 3 && resumeData && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === "resume"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Resume
                </button>
                <button
                  onClick={() => setActiveTab("coverLetter")}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === "coverLetter"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  Cover Letter
                </button>
              </nav>
            </div>

            {/* Resume Tab */}
            {activeTab === "resume" && (
              <div className="space-y-6">
                {/* Diff View - Show if we have original and tailored resumes */}
                {originalResumeData &&
                  resumeData &&
                  JSON.stringify(originalResumeData) !== JSON.stringify(resumeData) && (
                    <div className="rounded-lg bg-white shadow-sm">
                      <div className="border-b border-gray-200 p-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          What&apos;s Changed
                        </h2>
                      </div>
                      <div className="p-6">
                        <DiffView
                          originalResume={originalResumeData}
                          tailoredResume={resumeData}
                        />
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left: Editor */}
                  <div className="rounded-lg bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Edit Resume
                      </h2>
                    </div>
                    <div className="h-[calc(100vh-350px)] overflow-y-auto">
                      <ResumeEditor
                        resumeData={resumeData}
                        onUpdate={handleResumeUpdate}
                      />
                    </div>
                  </div>

                {/* Right: PDF Preview */}
                <div className="rounded-lg bg-white shadow-sm">
                  <div className="h-[calc(100vh-200px)]">
                    <PDFPreview resumeData={resumeData} />
                  </div>
                </div>
                </div>
              </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === "coverLetter" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Cover Letter Editor */}
                <div className="rounded-lg bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Cover Letter</h2>
                      {!coverLetter && (
                        <button
                          onClick={handleGenerateCoverLetter}
                          disabled={generatingCoverLetter || !jobDescription.trim()}
                          className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingCoverLetter ? (
                            <>
                              <Spinner className="mr-2 inline" />
                              Generating...
                            </>
                          ) : (
                            "Generate Cover Letter"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {coverLetter ? (
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={20}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Cover letter will appear here..."
                      />
                    ) : (
                      <div className="flex h-[calc(100vh-400px)] items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <p className="text-gray-500">
                            Click "Generate Cover Letter" to create a personalized cover letter
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Cover Letter Preview */}
                <div className="rounded-lg bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                  </div>
                  <div className="h-[calc(100vh-350px)] overflow-y-auto p-6">
                    {coverLetter ? (
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                          {coverLetter}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        <p>Cover letter preview will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
