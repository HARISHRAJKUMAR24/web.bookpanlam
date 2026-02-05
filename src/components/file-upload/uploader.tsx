"use client";

import { useState, useEffect } from "react";
import { FileUploader as ReactFileUploader } from "react-drag-drop-files";
import { uploadFile } from "@/lib/api/files";
import { getCookie } from "cookies-next";
import { Progress } from "../ui/progress";
import { ImageUp, Upload, File as FileIcon, X, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadsUrl } from "@/config";
import { cn } from "@/lib/utils";

interface UploaderProps {
  label?: string;
  value?: File | string | null;
  onChange?: (file: File) => void;
  accept?: string;
  fileTypes?: string[];
  multiple?: boolean;
  preview?: boolean;
  size?: "sm" | "md" | "lg";
  getFilesData?: () => void;
  maxSize?: number; // in MB
}

const Uploader = ({
  label,
  value,
  onChange,
  accept = "image/*",
  fileTypes = ["JPG", "PNG", "WEBP"],
  multiple = false,
  preview = true,
  size = "md",
  getFilesData,
  maxSize = 5, // 5MB default
}: UploaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle preview URL creation safely
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    if (typeof value === "object" && value !== null && "name" in value && "size" in value) {
      // It's a File-like object
      const url = URL.createObjectURL(value as any);
      setPreviewUrl(url);
      
      // Cleanup URL when component unmounts or value changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof value === "string") {
      // It's a string path/URL
      const url = value.startsWith("http")
        ? value
        : `${uploadsUrl}/${value}`;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  useEffect(() => {
    if (progress === 100) {
      setUploadSuccess(true);
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleFileChange = async (selectedFiles: any) => {
    setUploadError(null);
    
    const token = getCookie("token");
    if (!token || !selectedFiles) return;

    // Handle both single file and file list
    const filesArray = selectedFiles.length 
      ? Array.from(selectedFiles as FileList) 
      : [selectedFiles as File];

    // Check file size for each file
    for (const file of filesArray) {
      if (file.size > maxSize * 1024 * 1024) {
        setUploadError(`File size exceeds ${maxSize}MB limit`);
        return;
      }
    }

    const formData = new FormData();

    if (filesArray.length === 1) {
      const file = filesArray[0];
      formData.append("files", file);
      onChange?.(file);
    } else {
      filesArray.forEach((file, index) => {
        formData.append("files", file);
      });
      onChange?.(filesArray[0]);
    }

    try {
      await uploadFile(token, formData, setProgress);
      getFilesData?.();
    } catch (error) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange(null as any);
    }
    setPreviewUrl(null);
  };

  const containerClasses = cn(
    "relative transition-all duration-200",
    size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm"
  );

  const dropzoneClasses = cn(
    "group relative transition-all duration-300 cursor-pointer",
    "border-2 border-dashed rounded-xl",
    "bg-gradient-to-br from-white to-gray-50/50",
    "hover:from-gray-50 hover:to-gray-100",
    "dark:from-gray-900 dark:to-gray-800/50",
    "dark:hover:from-gray-800 dark:hover:to-gray-700/50",
    isDragging && "border-primary/50 bg-primary/5",
    uploadError && "border-destructive/50",
    uploadSuccess && "border-green-500/50",
    size === "sm" && "p-3",
    size === "md" && "p-6",
    size === "lg" && "p-8"
  );

  return (
    <div className={containerClasses}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Max: {maxSize}MB
          </span>
        </div>
      )}

      {preview && previewUrl && (
        <div className="relative group/preview mb-4">
          <div className="relative inline-block overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <img
              src={previewUrl}
              alt="Preview"
              className={cn(
                "object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover/preview:scale-105",
                size === "sm" ? "h-20 w-20" : "max-h-48"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300" />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      <ReactFileUploader
        handleChange={handleFileChange}
        name="file"
        multiple={multiple}
        types={fileTypes}
        accept={accept}
        onDraggingStateChange={setIsDragging}
        onTypeError={() => setUploadError(`Invalid file type. Allowed: ${fileTypes.join(", ")}`)}
        onSizeError={() => setUploadError(`File size exceeds ${maxSize}MB limit`)}
      >
        <div className={dropzoneClasses}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:20px_20px]" />
          </div>

          {/* Upload icon */}
          <div className="relative flex flex-col items-center">
            <div className={cn(
              "relative mb-3 p-3 rounded-full transition-all duration-300",
              "bg-gradient-to-br from-primary/10 to-primary/5",
              "group-hover:from-primary/20 group-hover:to-primary/10",
              isDragging && "scale-110",
              uploadError && "bg-destructive/10",
              uploadSuccess && "bg-green-500/10"
            )}>
              {uploadSuccess ? (
                <CheckCircle2 className={cn(
                  "text-green-600 dark:text-green-500",
                  size === "sm" ? "w-5 h-5" : "w-6 h-6"
                )} />
              ) : uploadError ? (
                <AlertCircle className={cn(
                  "text-destructive",
                  size === "sm" ? "w-5 h-5" : "w-6 h-6"
                )} />
              ) : isDragging ? (
                <Upload className={cn(
                  "text-primary animate-bounce",
                  size === "sm" ? "w-5 h-5" : "w-6 h-6"
                )} />
              ) : (
                <ImageUp className={cn(
                  "text-gray-600 dark:text-gray-400 group-hover:text-primary",
                  size === "sm" ? "w-5 h-5" : "w-6 h-6"
                )} />
              )}
            </div>

            {/* Text content */}
            <div className="text-center">
              <p className={cn(
                "font-medium mb-1",
                "text-gray-700 dark:text-gray-300",
                size === "sm" ? "text-xs" : "text-sm"
              )}>
                Drag & drop your {multiple ? "files" : "file"} here
              </p>
              
              <p className={cn(
                "text-gray-500 dark:text-gray-400",
                size === "sm" ? "text-xs" : "text-sm"
              )}>
                or{" "}
                <span className="text-primary font-medium underline underline-offset-2">
                  browse
                </span>{" "}
                from your device
              </p>

              {/* File types */}
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {fileTypes.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md",
                      "bg-gray-100 dark:bg-gray-800",
                      "text-gray-600 dark:text-gray-400",
                      "border border-gray-200 dark:border-gray-700",
                      size === "sm" ? "text-[10px]" : "text-xs"
                    )}
                  >
                    <FileIcon size={10} />
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Success/Error messages */}
            {uploadSuccess && (
              <div className="absolute -bottom-6 left-0 right-0">
                <p className="text-xs text-green-600 dark:text-green-500 font-medium text-center animate-in slide-in-from-bottom-1">
                  Upload successful!
                </p>
              </div>
            )}

            {uploadError && (
              <div className="absolute -bottom-6 left-0 right-0">
                <p className="text-xs text-destructive font-medium text-center animate-in slide-in-from-bottom-1">
                  {uploadError}
                </p>
              </div>
            )}
          </div>
        </div>
      </ReactFileUploader>

      {/* Progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="mt-4 space-y-2 animate-in fade-in">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/70"
          />
        </div>
      )}

      {/* Helper text */}
      <p className={cn(
        "mt-2 text-gray-500 dark:text-gray-400",
        size === "sm" ? "text-xs" : "text-sm"
      )}>
        Supported: {fileTypes.join(", ")} • Max size: {maxSize}MB
      </p>
    </div>
  );
};

export default Uploader;