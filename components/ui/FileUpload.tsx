"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = "application/pdf",
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === accept) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [accept, onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === accept) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [accept, onFileSelect]
  );

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-colors",
        isDragging
          ? "border-primary-500 bg-primary-50"
          : "border-gray-300 bg-white hover:border-primary-400",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 cursor-pointer opacity-0"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center p-8"
      >
        <svg
          className="mb-4 h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm font-semibold text-gray-700">
          {selectedFile
            ? selectedFile.name
            : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-gray-500">PDF files only</p>
      </label>
    </div>
  );
}

