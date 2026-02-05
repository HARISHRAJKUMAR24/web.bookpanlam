"use client";

import Image from "next/image";
import { Upload, Loader2, X, Check } from "lucide-react";
import { useState, useRef } from "react";
import { uploadsUrl, apiUrl } from "@/config";
import { toast } from "sonner";

export default function FaviconUpload({ value, setValue }: { 
  value: string; 
  setValue: (value: string) => void 
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = value
    ? `${uploadsUrl}/${value.replace(/^sellers\//, "")}`
    : "";

  const handleFileSelect = async (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
      toast.error("Only PNG and JPG files are allowed");
      return;
    }

    const maxSize = 100 * 1024; 
    if (file.size > maxSize) {
      toast.error("File must be less than 100KB");
      return;
    }

    setUploading(true);
    setDragOver(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = document.cookie
        .split("; ")
        .find((r) => r.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(
        `${apiUrl}/seller/settings/basic-settings/upload-favicon.php`,
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
        toast.success("Favicon uploaded!");
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
      e.target.value = "";
    }
  };

const removeFavicon = async () => {
  if (!value) return;

  try {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];

    const res = await fetch(
      `${apiUrl}/seller/settings/basic-settings/delete-favicon.php`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ filename: value })
      }
    );

    const data = await res.json();
console.log("Delete Response:", data);

    if (data.success) {
      setValue("");
      toast.info("Favicon removed & deleted from server");
    } else {
      toast.error(data.message || "Failed to delete favicon");
    }
  } catch (err) {
    toast.error("Error deleting favicon");
  }
};


  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-full
          transition-all duration-200 cursor-pointer
          flex items-center justify-center
          w-48 h-48 mx-auto
          ${dragOver 
            ? 'border-4 border-blue-400 bg-blue-50' 
            : 'border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-60 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".png,.jpg,.jpeg"
          onChange={handleFileChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-white p-4">
              <Image
                src={previewUrl}
                alt="Favicon"
                width={120}
                height={120}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            
            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFavicon();
              }}
              className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">
                Upload Favicon
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG or JPG • 100KB max
              </p>
            </div>
          </div>
        )}
      </div>

      {dragOver && (
        <div className="absolute inset-0 bg-blue-500/10 border-4 border-blue-400 border-dashed rounded-full flex items-center justify-center pointer-events-none">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Drop here
          </div>
        </div>
      )}
    </div>
  );
}