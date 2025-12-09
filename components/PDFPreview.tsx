"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect } from "react";

interface PDFPreviewProps {
  pdfUrl: string | null;
}

export default function PDFPreview({ pdfUrl }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">No PDF to preview</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-white p-4">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        </div>
      )}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))}
          disabled={pageNumber <= 1}
          className="rounded-md bg-primary-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {pageNumber} of {numPages || "?"}
        </span>
        <button
          onClick={() =>
            setPageNumber((prev) => Math.min(numPages || 1, prev + 1))
          }
          disabled={pageNumber >= (numPages || 1)}
          className="rounded-md bg-primary-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          </div>
        }
        className="flex justify-center"
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="shadow-lg"
          width={600}
        />
      </Document>
    </div>
  );
}

