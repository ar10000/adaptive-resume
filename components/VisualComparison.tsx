"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ResumeData } from "@/types";
import { exportResumeToPDF } from "@/lib/exportPDF";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface VisualComparisonProps {
  originalResume: ResumeData;
  tailoredResume: ResumeData;
}

type StyleVariant = "classic" | "professional" | "modern";

export default function VisualComparison({
  originalResume,
  tailoredResume,
}: VisualComparisonProps) {
  const [selectedStyle, setSelectedStyle] = useState<StyleVariant>("professional");
  const [originalPdfUrl, setOriginalPdfUrl] = useState<string | null>(null);
  const [tailoredPdfUrl, setTailoredPdfUrl] = useState<string | null>(null);
  const [originalNumPages, setOriginalNumPages] = useState<number>(0);
  const [tailoredNumPages, setTailoredNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.8); // Slightly zoomed out for comparison

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  // Generate PDFs when style changes
  useEffect(() => {
    const generatePDFs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Generate original PDF
        const originalBlob = exportResumeToPDF(originalResume);
        const originalUrl = URL.createObjectURL(originalBlob);
        
        // Generate tailored PDF with selected style
        // For now, we'll use the same export function
        // In the future, we could pass style variant to modify the design system
        const tailoredBlob = exportResumeToPDF(tailoredResume);
        const tailoredUrl = URL.createObjectURL(tailoredBlob);

        // Clean up previous URLs
        if (originalPdfUrl) URL.revokeObjectURL(originalPdfUrl);
        if (tailoredPdfUrl) URL.revokeObjectURL(tailoredPdfUrl);

        setOriginalPdfUrl(originalUrl);
        setTailoredPdfUrl(tailoredUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate PDFs");
      } finally {
        setLoading(false);
      }
    };

    generatePDFs();

    // Cleanup function
    return () => {
      if (originalPdfUrl) URL.revokeObjectURL(originalPdfUrl);
      if (tailoredPdfUrl) URL.revokeObjectURL(tailoredPdfUrl);
    };
  }, [originalResume, tailoredResume, selectedStyle]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(0.8);
  };

  const getStyleDescription = (style: StyleVariant): string => {
    switch (style) {
      case "classic":
        return "Minimal ATS-optimized design with clean lines and standard formatting";
      case "professional":
        return "Professional design with accent colors and subtle visual hierarchy";
      case "modern":
        return "Modern design with background elements and enhanced visual appeal";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Generating comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header with Style Toggle */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Visual Comparison
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {getStyleDescription(selectedStyle)}
            </p>
          </div>

          {/* Style Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStyle("classic")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedStyle === "classic"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Classic ATS
            </button>
            <button
              onClick={() => setSelectedStyle("professional")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedStyle === "professional"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Professional
            </button>
            <button
              onClick={() => setSelectedStyle("modern")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                selectedStyle === "modern"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Modern
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              disabled={zoom >= 1.5}
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
          <div className="text-sm text-gray-600">
            Compare side-by-side to see the transformation
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="flex flex-1 overflow-auto bg-gray-100 p-4">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT: Original Resume */}
          <div className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-md">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
              <h4 className="text-sm font-semibold text-gray-700">
                Original Resume
              </h4>
              <p className="text-xs text-gray-500">Your uploaded resume</p>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {originalPdfUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <Document
                    file={originalPdfUrl}
                    onLoadSuccess={({ numPages }) => setOriginalNumPages(numPages)}
                    loading={
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                      </div>
                    }
                    className="flex flex-col items-center"
                  >
                    {Array.from(new Array(originalNumPages), (el, index) => (
                      <div
                        key={`original_page_${index + 1}`}
                        className="mb-4 shadow-lg"
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: "top center",
                          transition: "transform 0.2s ease-in-out",
                        }}
                      >
                        <Page
                          pageNumber={index + 1}
                          width={612 * zoom}
                          renderTextLayer={true}
                          renderAnnotationLayer={false}
                          className="border border-gray-300 bg-white"
                        />
                        {originalNumPages > 1 && (
                          <div className="mt-2 text-center">
                            <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                              Page {index + 1} of {originalNumPages}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </Document>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Loading original resume...</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Tailored Resume */}
          <div className="flex flex-col rounded-lg border-2 border-primary-500 bg-white shadow-md">
            <div className="border-b border-primary-200 bg-primary-50 px-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-primary-900">
                    Tailored Resume
                  </h4>
                  <p className="text-xs text-primary-700">
                    Optimized with {selectedStyle} style
                  </p>
                </div>
                <span className="rounded-full bg-primary-600 px-2 py-1 text-xs font-medium text-white">
                  {selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {tailoredPdfUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <Document
                    file={tailoredPdfUrl}
                    onLoadSuccess={({ numPages }) => setTailoredNumPages(numPages)}
                    loading={
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                      </div>
                    }
                    className="flex flex-col items-center"
                  >
                    {Array.from(new Array(tailoredNumPages), (el, index) => (
                      <div
                        key={`tailored_page_${index + 1}`}
                        className="mb-4 shadow-lg"
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: "top center",
                          transition: "transform 0.2s ease-in-out",
                        }}
                      >
                        <Page
                          pageNumber={index + 1}
                          width={612 * zoom}
                          renderTextLayer={true}
                          renderAnnotationLayer={false}
                          className="border border-primary-300 bg-white"
                        />
                        {tailoredNumPages > 1 && (
                          <div className="mt-2 text-center">
                            <span className="inline-block rounded-full bg-primary-200 px-3 py-1 text-xs font-medium text-primary-800">
                              Page {index + 1} of {tailoredNumPages}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </Document>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Loading tailored resume...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Trust Message */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">🛡️</span>
            <span>
              Your tailored resume uses only information from your original resume.
              No skills or experience were added.
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Choose your preferred style before downloading
          </div>
        </div>
      </div>
    </div>
  );
}

