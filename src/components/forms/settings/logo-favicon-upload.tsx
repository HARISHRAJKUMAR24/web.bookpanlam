"use client";

import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadLogo, uploadFavicon } from "@/lib/api/basic-settings";

interface Props {
  value: string;
  setValue: (v: string) => void;
  userId: number;
  type: "logo" | "favicon";
  label?: string;
}

export default function LogoFaviconUpload({ value, setValue, userId, type, label }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      let result;
      
      if (type === "logo") {
        result = await uploadLogo(formData);
      } else {
        result = await uploadFavicon(formData);
      }

      console.log("Upload result:", result);
      
      if (result.success) {
        // Store the filename returned from the server
        setValue(result.filename);
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (error: any) {
      setError(error.message || "Upload error");
      console.error(`Upload failed:`, error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setValue("");
    setError("");
  };

  // Build image URL for preview
  const getImageUrl = () => {
    if (!value) return "";
    
    // Check if it's already a full URL (from get.php)
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    
    // If it's stored as just a filename/path, prepend the base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/manager.bookpanlam';
    
    // Check if value already has "uploads/" prefix
    if (value.startsWith("uploads/")) {
      return `${baseUrl}/${value}`;
    } else {
      return `${baseUrl}/uploads/${value}`;
    }
  };

  const imageUrl = getImageUrl();
  const displayLabel = label || (type === "logo" ? "Logo" : "Favicon");

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Label */}
      <div className="w-full md:w-1/4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {displayLabel}
        </label>
        <p className="text-xs text-gray-500">
          {type === "logo" 
            ? "PNG, JPG, SVG (Max 2MB)" 
            : "ICO, PNG (Max 1MB)"}
        </p>
      </div>

      {/* Image Preview */}
      <div className="w-full md:w-1/4">
        <div className={`${type === 'logo' ? 'h-20' : 'h-16 w-16'} bg-white border border-gray-300 rounded flex items-center justify-center overflow-hidden`}>
          {imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                fill
                className="object-contain p-2"
                alt={displayLabel}
                sizes={type === 'logo' ? "160px" : "64px"}
                unoptimized
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  console.log("Current value:", value);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="text-gray-400 p-4">
              <Upload size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>{value ? "Change File" : "Upload File"}</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={type === 'logo' ? "image/*" : ".ico,image/x-icon,image/png"}
                disabled={uploading}
              />
            </div>
          </label>

          {value && (
            <button
              onClick={handleRemove}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-1"
              type="button"
            >
              <X size={14} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* File info */}
        {value && !error && (
          <div className="mt-2 text-xs text-gray-500">
            <p>Uploaded: {value}</p>
            <p className="text-xs text-blue-600">
              {imageUrl && (
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  View Image
                </a>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}