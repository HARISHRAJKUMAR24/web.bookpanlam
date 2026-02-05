"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { apiUrl, uploadsUrl } from "@/config";

interface Props {
  images: string[];
  setImages: (v: string[]) => void;
  userId: string;
}

const DepartmentAdditionalImages = ({ images, setImages, userId }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];

    if (!files.length) return;

    setIsUploading(true);

    const newImages: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${apiUrl}/seller/departments/upload.php?user_id=${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      if (result.success) {
        newImages.push(result.filename);
      }
    }

    setIsUploading(false);
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const arr = [...images];
    arr.splice(index, 1);
    setImages(arr);
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <h3 className="font-medium text-lg">Additional Images</h3>

      {/* Upload Box */}
      <label className="block border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mt-3">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <p className="text-gray-500">Click to upload more images</p>
        {isUploading && (
          <p className="text-blue-500 mt-2 text-sm">Uploading...</p>
        )}
      </label>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {images.map((img, index) => {
            const imgSrc = img.startsWith("http")
              ? img
              : `${uploadsUrl}/${img}`;

            return (
              <div key={index} className="relative w-full">
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow"
                >
                  <X size={14} />
                </button>

                <Image
                  src={imgSrc}
                  width={200}
                  height={200}
                  alt="Additional"
                  className="rounded-lg object-cover border w-full h-[120px]"
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentAdditionalImages;
