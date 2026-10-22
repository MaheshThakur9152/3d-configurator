import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { validateGLBFile, GLBValidationResult } from '../lib/glb-validator';

interface ModelUploadZoneProps {
  onFileLoaded: (file: File) => void;
  isLoading: boolean;
  activeFileName?: string;
}

export const ModelUploadZone: React.FC<ModelUploadZoneProps> = ({
  onFileLoaded,
  isLoading,
  activeFileName,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<GLBValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    const result = await validateGLBFile(file);
    setValidationResult(result);

    if (result.valid) {
      onFileLoaded(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-gray-900 bg-gray-50/80 scale-[1.01]'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50/40 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-xs">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <h3 className="text-sm font-semibold text-gray-900">
          {activeFileName ? `Current: ${activeFileName}` : 'Upload Designer 3D Asset'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Drag & drop your binary <span className="font-mono font-medium text-gray-700">.glb</span> model here, or click to browse
        </p>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-400">
          <span>Max 50 MB</span>
          <span>•</span>
          <span>DRACO Compressed supported</span>
          <span>•</span>
          <span>Watertight geometry</span>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center rounded-xl z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
              <span>Decompressing & Parsing 3D Scene...</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors & Warnings */}
      {validationResult && !validationResult.valid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationResult.error}</span>
        </div>
      )}

      {validationResult && validationResult.warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex flex-col gap-1">
          {validationResult.warnings.map((w, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
