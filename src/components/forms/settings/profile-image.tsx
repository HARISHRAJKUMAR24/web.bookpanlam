"use client";

import Image from "next/image";
import { Upload, X, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadsUrl, apiUrl } from "@/config";
import { toast } from "sonner";

interface Props {
  value: string;
  setValue: (v: any) => void;
  userId: number;
}

export default function ProfileImage({ value, setValue, userId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${apiUrl}/seller/profile/upload-profile.php?user_id=${userId}`, 
        { method: "POST", body: formData }
      );

      const result = await res.json();

      if (result.success) {
        setValue(result.image);
        toast.success("Profile photo updated!");
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };
const handleRemove = async () => {
  if (!value) return;

  try {
    const res = await fetch(`${apiUrl}/seller/profile/delete-profile.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        path: value
      })
    });

    const result = await res.json();

    if (result.success) {
      setValue("");
      toast.success("Profile photo removed!");
    } else {
      toast.error(result.message || "Unable to delete profile photo");
    }
  } catch (error) {
    toast.error("Delete failed");
  }
};

  const finalImageUrl = value
    ? `${uploadsUrl}${value.replace("/uploads/sellers", "")}`
    : "";

  return (
    <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Upload a professional photo for your profile
          </p>
        </div>

        {value && !uploading && (
          <button
            onClick={handleRemove}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={16} />
            Remove Photo
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
              {finalImageUrl ? (
                <Image
                  src={finalImageUrl}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  alt="Profile"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {value && (
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">Current Photo</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          {!value ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 transition-all ${dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
                  {uploading ? (
                    <Loader2 size={28} className="text-blue-600 animate-spin" />
                  ) : (
                    <Upload size={28} className="text-blue-600" />
                  )}
                </div>

                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {uploading ? "Uploading..." : "Upload your photo"}
                </h4>

                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Drag & drop your photo here, or click to browse
                </p>

                <div className="flex justify-center">
                  <label className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-md hover:shadow-lg">
                    <Upload size={18} className="mr-2" />
                    Browse Files
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*"
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="mt-6 text-xs text-gray-400 space-y-1">
                  <p>Supports: JPG, PNG, WEBP (Max 5MB)</p>
                  <p>Recommended: Square image, 400x400px minimum</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-4">Replace Photo</h4>

              <div className="grid md:grid-cols-2 gap-4">
                <label className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload size={24} className="mx-auto text-gray-500 mb-3" />
                  <p className="font-medium text-gray-900 mb-1">Upload New</p>
                  <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                    disabled={uploading}
                  />
                </label>

                <div className="border border-gray-200 rounded-xl p-6 text-center bg-white">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-3">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">Use Default</p>
                  <p className="text-sm text-gray-500">Reset to default avatar</p>
                </div>
              </div>

              {uploading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 size={18} className="text-blue-600 animate-spin" />
                    <p className="font-medium text-blue-900">Uploading...</p>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}