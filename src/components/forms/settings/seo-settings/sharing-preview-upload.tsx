"use client";

import Image from "next/image";
import { Upload, Loader2, Globe, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { apiUrl, uploadsUrl } from "@/config";

interface Props {
  value: string;
  setValue: (value: string) => void;
  userId: number;

  // Add these:
  metaTitle?: string;
  metaDescription?: string;
}

export default function SharingPreviewUpload({
  value,
  setValue,
  userId,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const normalizedPath = value?.startsWith("sellers/")
    ? value.replace(/^sellers\//, "")
    : value;

  const previewUrl = normalizedPath
    ? `${uploadsUrl}/${normalizedPath}`
    : null;

  const handleFileSelect = async (file: File) => {
    if (uploading) return;

    const oldFile = value; // ⭐ previous file to delete

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("old_file", oldFile);
    formData.append("user_id", String(userId));

    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];

    try {
      const res = await fetch(
        `${apiUrl}/seller/settings/seo-settings/upload-sharing-preview.php`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (result.success) {
        setValue(result.filename);
        setUploadSuccess(true);
      } else {
        setUploadError(result.message || "Upload failed");
      }
    } catch {
      setUploadError("Network error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!value) return;

    // 🟦 Debug #1 — what filename are we deleting?
    console.log("DELETE REQUEST filename:", value);

    try {
      const res = await fetch(
        `${apiUrl}/seller/settings/seo-settings/delete-sharing-preview.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: value,
          }),
        }
      );

      const result = await res.json();

      // 🟦 Debug #2 — what response do we get from backend?
      console.log("DELETE RESPONSE:", result);

      if (result.success) {
        setValue("");
        setUploadSuccess(false);
        setUploadError(null);
        setImageError(false);
      } else {
        setUploadError(result.message || "Delete failed");
      }
    } catch (err) {
      setUploadError("Network error");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
            Website Preview Image
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Image shown when your website is shared
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-3 rounded-lg border border-blue-100 self-start sm:self-auto">
          <Globe size={18} className="sm:w-5 sm:h-5 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1 bg-gray-700 rounded-md px-2 sm:px-3 py-1 sm:py-1.5">
            <div className="text-xs text-gray-300 truncate flex items-center gap-1 sm:gap-2">
              <Globe size={10} className="text-gray-400" />
              website-preview.com
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {uploading ? (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-3 sm:mb-4" />
                <p className="text-sm font-medium text-gray-700">Uploading...</p>
              </div>
            ) : previewUrl && !imageError ? (
              <div className="absolute inset-0">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="relative w-full h-full max-w-full max-h-full">
                    <Image
                      src={previewUrl}
                      alt="Website Preview"
                      fill
                      className="object-contain"
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  </div>
                </div>

                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute inset-0 bg-black/20"></div>

                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 w-full px-3 sm:px-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-full px-3 sm:px-4 py-2 sm:py-3 shadow-lg max-w-lg mx-auto">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-800">Preview Image</span>
                      </div>
                      <div className="h-px sm:h-4 w-full sm:w-px bg-gray-300"></div>
                      <div className="flex gap-2 justify-center sm:justify-end">
                        <button
                          onClick={() => document.getElementById("file-input")?.click()}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                        >
                          Change
                        </button>
                        <button
                          onClick={handleRemoveImage}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => document.getElementById("file-input")?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              >
                {dragOver ? (
                  <div className="absolute inset-0 border-4 border-dashed border-blue-400 bg-blue-50/50 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-white rounded-full inline-block">
                        <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-blue-700">Drop to upload</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 sm:mb-4 md:mb-6 p-2.5 sm:p-3 md:p-4 lg:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full border border-blue-100 mx-auto">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-blue-600 mx-auto" />
                    </div>
                    <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 md:px-8">
                      <div>
                        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
                          Upload Preview Image
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400">
                        PNG, JPG, WebP • Max 5MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) =>
              e.target.files && handleFileSelect(e.target.files[0])
            }
          />
        </div>

        <div className="p-3 sm:p-4 border-t border-gray-200">
          <div className="space-y-2 sm:space-y-3">
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-green-50 text-green-700 p-2 sm:p-3 rounded-lg border border-green-200">
                <CheckCircle size={14} className="sm:w-4 sm:h-4" />
                <span>Image uploaded successfully</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-red-50 text-red-700 p-2 sm:p-3 rounded-lg border border-red-200">
                <X size={14} className="sm:w-4 sm:h-4" />
                <span className="flex-1">{uploadError}</span>
                <button
                  onClick={() => setUploadError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}