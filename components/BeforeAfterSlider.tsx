"use client";

import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ResumeData } from "@/types";
import { exportResumeToPDF } from "@/lib/exportPDF";
import { ThemePreset } from "@/lib/design/presets";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface BeforeAfterSliderProps {
  originalResume: ResumeData;
  tailoredResume: ResumeData;
  theme?: ThemePreset;
}

export default function BeforeAfterSlider({
  originalResume,
  tailoredResume,
  theme = "professional",
}: BeforeAfterSliderProps) {
  const [beforePdfUrl, setBeforePdfUrl] = useState<string | null>(null);
  const [afterPdfUrl, setAfterPdfUrl] = useState<string | null>(null);
  const [beforeNumPages, setBeforeNumPages] = useState<number>(0);
  const [afterNumPages, setAfterNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0-100
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  // Generate PDFs
  useEffect(() => {
    const generatePDFs = async () => {
      setLoading(true);
      setError(null);

      try {
        // Generate "before" PDF (generic, poor spacing - using classic theme)
        const beforeBlob = exportResumeToPDF(originalResume, "classic");
        const beforeUrl = URL.createObjectURL(beforeBlob);

        // Generate "after" PDF (beautiful design - using selected theme)
        const afterBlob = exportResumeToPDF(tailoredResume, theme);
        const afterUrl = URL.createObjectURL(afterBlob);

        // Clean up previous URLs
        if (beforePdfUrl) URL.revokeObjectURL(beforePdfUrl);
        if (afterPdfUrl) URL.revokeObjectURL(afterPdfUrl);

        setBeforePdfUrl(beforeUrl);
        setAfterPdfUrl(afterUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate PDFs");
      } finally {
        setLoading(false);
      }
    };

    generatePDFs();

    // Cleanup function
    return () => {
      if (beforePdfUrl) URL.revokeObjectURL(beforePdfUrl);
      if (afterPdfUrl) URL.revokeObjectURL(afterPdfUrl);
    };
  }, [originalResume, tailoredResume, theme]);

  // Handle mouse/touch events for slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

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
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Visual Transformation
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Drag the slider to compare before and after
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-red-500 bg-red-100"></div>
              <span className="text-sm font-medium text-gray-700">Before</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-green-500 bg-green-100"></div>
              <span className="text-sm font-medium text-gray-700">After</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-gray-100"
        onMouseDown={handleMouseDown}
        onTouchMove={handleTouchMove}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Before (Left Side) */}
        <div
          className="absolute inset-0 overflow-auto bg-white"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          {beforePdfUrl && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="mb-2 rounded-md bg-red-100 px-3 py-1">
                <span className="text-xs font-semibold text-red-800">
                  BEFORE: Generic Resume
                </span>
              </div>
              <Document
                file={beforePdfUrl}
                onLoadSuccess={({ numPages }) => setBeforeNumPages(numPages)}
                loading={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  </div>
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(beforeNumPages), (el, index) => (
                  <div
                    key={`before_page_${index + 1}`}
                    className="mb-4 shadow-lg"
                  >
                    <Page
                      pageNumber={index + 1}
                      width={500}
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      className="border border-gray-300 bg-white"
                    />
                  </div>
                ))}
              </Document>
            </div>
          )}
        </div>

        {/* After (Right Side) */}
        <div
          className="absolute inset-0 overflow-auto bg-white"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          {afterPdfUrl && (
            <div className="flex flex-col items-center gap-4 p-4">
              <div className="mb-2 rounded-md bg-green-100 px-3 py-1">
                <span className="text-xs font-semibold text-green-800">
                  AFTER: Professional Design
                </span>
              </div>
              <Document
                file={afterPdfUrl}
                onLoadSuccess={({ numPages }) => setAfterNumPages(numPages)}
                loading={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                  </div>
                }
                className="flex flex-col items-center"
              >
                {Array.from(new Array(afterNumPages), (el, index) => (
                  <div
                    key={`after_page_${index + 1}`}
                    className="mb-4 shadow-lg"
                  >
                    <Page
                      pageNumber={index + 1}
                      width={500}
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      className="border border-primary-300 bg-white"
                    />
                  </div>
                ))}
              </Document>
            </div>
          )}
        </div>

        {/* Slider Handle */}
        <div
          ref={sliderRef}
          className="absolute top-0 bottom-0 z-10 flex w-1 items-center justify-center bg-primary-600 transition-all"
          style={{
            left: `${sliderPosition}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary-600 shadow-lg transition-transform hover:scale-110">
            <div className="flex gap-1">
              <div className="h-1 w-1 rounded-full bg-white"></div>
              <div className="h-1 w-1 rounded-full bg-white"></div>
              <div className="h-1 w-1 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 z-0 w-0.5 bg-primary-400 opacity-50"
          style={{ left: `${sliderPosition}%` }}
        ></div>
      </div>

      {/* Footer with Instructions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">✨</span>
            <span>
              See the transformation: Better spacing, professional design, ATS-optimized
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Drag slider or click to adjust
          </div>
        </div>
      </div>
    </div>
  );
}

