"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/types";
import { exportResumeToPDF } from "@/lib/exportPDF";
import { exportResumeToDOCX } from "@/lib/exportDOCX";
import {
  checkVisualConsistency,
  formatQualityScore,
  getQualityBadgeColor,
  getQualityStatus,
} from "@/lib/qualityControl/visualQA";
import {
  ThemePreset,
  getPresetDescription,
  getPresetDisplayName,
} from "@/lib/design/presets";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface PDFPreviewProps {
  resumeData: ResumeData | null;
  theme?: ThemePreset;
}

export default function PDFPreview({
  resumeData,
  theme = "professional",
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset>(theme);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  // Generate PDF blob from resumeData
  useEffect(() => {
    if (!resumeData) {
      setPdfBlob(null);
      setPdfUrl(null);
      setNumPages(0);
      return;
    }

    const generatePDF = async () => {
      setLoading(true);
      setError(null);

      try {
        const blob = exportResumeToPDF(resumeData, selectedTheme);
        setPdfBlob(blob);

        // Run visual QA check
        try {
          const qaReport = checkVisualConsistency(blob, resumeData);
          setQualityScore(qaReport.overall);
        } catch (qaError) {
          // QA check failed, but don't block PDF generation
          console.warn("Visual QA check failed:", qaError);
        }

        // Create object URL for preview
        const url = URL.createObjectURL(blob);
        
        // Clean up previous URL
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }
        
        setPdfUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate PDF");
        setPdfBlob(null);
        setPdfUrl(null);
        setQualityScore(null);
      } finally {
        setLoading(false);
      }
    };

    generatePDF();

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resumeData, selectedTheme, pdfUrl]);

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const handleDocumentLoadError = useCallback((error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const handleDownloadPDF = async () => {
    if (!resumeData || !pdfBlob) return;

    setDownloading("pdf");
    try {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!resumeData) return;

    setDownloading("docx");
    try {
      const blob = await exportResumeToDOCX(resumeData);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download DOCX");
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!resumeData) return;

    try {
      // Convert resume data to plain text format
      let text = `${resumeData.personalInfo.name}\n`;
      
      if (resumeData.personalInfo.email) {
        text += `${resumeData.personalInfo.email}\n`;
      }
      if (resumeData.personalInfo.phone) {
        text += `${resumeData.personalInfo.phone}\n`;
      }
      if (resumeData.personalInfo.location) {
        text += `${resumeData.personalInfo.location}\n`;
      }
      if (resumeData.personalInfo.linkedIn) {
        text += `${resumeData.personalInfo.linkedIn}\n`;
      }
      
      text += `\n${resumeData.summary || ""}\n\n`;
      
      text += "WORK EXPERIENCE\n";
      for (const exp of resumeData.workExperience) {
        text += `\n${exp.title} | ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.endDate}\n`;
        for (const bullet of exp.bullets) {
          const displayBullet = bullet.replace(/\[LESS_RELEVANT\]/g, "").trim();
          if (displayBullet) {
            text += `• ${displayBullet}\n`;
          }
        }
      }
      
      text += "\nEDUCATION\n";
      for (const edu of resumeData.education) {
        text += `\n${edu.degree} in ${edu.field}\n`;
        text += `${edu.institution} | ${edu.graduationDate}\n`;
      }
      
      text += "\nSKILLS\n";
      text += `${resumeData.skills.join(", ")}\n`;
      
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        text += "\nCERTIFICATIONS\n";
        for (const cert of resumeData.certifications) {
          text += `• ${cert}\n`;
        }
      }

      await navigator.clipboard.writeText(text);
      
      // Show temporary success message
      const button = document.querySelector('[data-copy-button]') as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = "Copied!";
        setTimeout(() => {
          if (button) button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  if (!resumeData) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">No resume data to preview</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={() => {
              setError(null);
              // Retry by triggering useEffect
              if (resumeData) {
                const blob = exportResumeToPDF(resumeData);
                setPdfBlob(blob);
                const url = URL.createObjectURL(blob);
                if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                setPdfUrl(url);
              }
            }}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Style:</span>
            <div className="flex gap-1 rounded-md border border-gray-300 bg-white p-1">
              {(["classic", "professional", "modern"] as ThemePreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => setSelectedTheme(preset)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTheme === preset
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title={getPresetDescription(preset)}
                  >
                    {getPresetDisplayName(preset)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quality Score Badge */}
          {qualityScore !== null && (
            <div
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${getQualityBadgeColor(
                qualityScore
              )}`}
              title={`Quality Status: ${getQualityStatus(qualityScore)}`}
            >
              {formatQualityScore(qualityScore)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            −
          </button>
          <span className="min-w-[60px] text-center text-sm text-gray-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 2.0}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleResetZoom}
            className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>

        {/* Page Count */}
        {numPages > 0 && (
          <div className="text-sm text-gray-600">
            {numPages} page{numPages !== 1 ? "s" : ""}
          </div>
        )}

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={!pdfBlob || downloading === "pdf"}
            className="rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === "pdf" ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Downloading...
              </span>
            ) : (
              "Download PDF"
            )}
          </button>
          <button
            onClick={handleDownloadDOCX}
            disabled={!resumeData || downloading === "docx"}
            className="rounded-md bg-gray-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading === "docx" ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                Downloading...
              </span>
            ) : (
              "Download DOCX"
            )}
          </button>
          <button
            onClick={handleCopyToClipboard}
            data-copy-button
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="Copy resume as plain text"
          >
            Copy Text
          </button>
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {pdfUrl ? (
          <div className="flex flex-col items-center gap-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                </div>
              }
              className="flex flex-col items-center"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-4 shadow-lg"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <Page
                    pageNumber={index + 1}
                    width={612 * zoom} // Letter width in points (8.5" * 72pt/inch)
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                    className="border border-gray-300 bg-white"
                  />
                  {/* Page Number Badge */}
                  {numPages > 1 && (
                    <div className="mt-2 text-center">
                      <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                        Page {index + 1} of {numPages}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Document>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Generating PDF preview...</p>
          </div>
        )}
      </div>
    </div>
  );
}
