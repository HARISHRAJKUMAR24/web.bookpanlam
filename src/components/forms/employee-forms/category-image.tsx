"use client";
import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { apiUrl } from "@/config";

interface Props {
  images: { value: string; setValue: (v: string) => void };
  userId: string | number;
}

const EmployeeImage = ({ images, userId }: Props) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    // send old image so backend deletes it
    if (images.value) {
      formData.append("old_image", images.value);
    }

    const res = await fetch(
      `${apiUrl}/seller/employees/upload.php?user_id=${userId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();
    setIsUploading(false);

    if (result.success) {
      images.setValue(result.filename);
    }
  };

  const handleRemove = async () => {
    if (!images.value) return;

    await fetch(`${apiUrl}/seller/employees/delete-image.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_image: images.value }),
    });

    images.setValue(""); // remove from UI
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <h3 className="font-medium text-lg">Employee Image</h3>

      {!images.value && (
        <label className="block border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <p className="text-gray-500">Click to upload</p>
          {isUploading && <p className="text-blue-500 mt-2 text-sm">Uploading...</p>}
        </label>
      )}

      {images.value && (
        <div className="relative w-[160px] mt-4">
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow"
          >
            <X size={14} />
          </button>

          <Image
            src={`${apiUrl}${images.value}`}
            width={160}
            height={160}
            alt="Employee"
            unoptimized
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeImage;
