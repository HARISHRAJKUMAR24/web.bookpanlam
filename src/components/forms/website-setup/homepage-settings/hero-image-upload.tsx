"use client";

import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadsUrl, apiUrl } from "@/config";
import Cookies from "js-cookie";

interface Props {
  value: { url: string; path: string };
  setValue: (v: { url: string; path: string }) => void;
}

export default function HeroImageUpload({ value, setValue }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = value?.url || "";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get("token");
    if (!token) {
      console.error("❌ Missing auth token");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${apiUrl}/seller/website-setup/homepage-settings/upload-hero-image.php`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );

      const result = await res.json();
      console.log("🟢 HERO UPLOAD RESULT →", result);

      if (result.success && result.filename) {
        // 🔥 FIX: normalize path for preview ONLY
        const previewPath = result.filename.startsWith("sellers/")
          ? result.filename.replace(/^sellers\//, "")
          : result.filename;

        const fullUrl = `${uploadsUrl}/${previewPath}?t=${Date.now()}`;

        setValue({
          url: fullUrl,          // ✅ preview works instantly
          path: result.filename, // ✅ DB path untouched
        });
      }
    } catch (err) {
      console.error("🔥 HERO UPLOAD ERROR →", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-6">
      <p className="font-medium mb-2">Hero Image</p>

      <label className="cursor-pointer w-48 h-48 bg-gray-100 border rounded-lg flex items-center justify-center overflow-hidden">
        {uploading ? (
          <Loader2 className="animate-spin" />
        ) : previewUrl ? (
          <Image
            key={previewUrl} // 🔥 force re-render
            src={previewUrl}
            alt="Hero Image"
            width={200}
            height={200}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <Upload size={32} className="text-gray-500" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </label>
    </div>
  );
}
