"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Pencil,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Eye,
  Grid3x3,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadBannerImage, deleteBannerImage} from "@/lib/api/banner-upload";
import { uploadsUrl } from "@/config";

interface Banner {
  url: string;
  path: string;
  title?: string;
  link?: string;
  order?: number;
}

interface Props {
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
}

const MAX_BANNERS = 5;

const BannersUpload = ({ banners, setBanners }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", link: "" });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= UPLOAD ================= */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (banners.length + files.length > MAX_BANNERS) {
      toast.error(`Maximum ${MAX_BANNERS} banners allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploaded: Banner[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await uploadBannerImage(formData);

        if (res?.success && res?.data?.path) {
          const previewPath = res.data.path.replace(/^seller\//, "");
          uploaded.push({
            url: `${uploadsUrl}/${previewPath}?t=${Date.now()}`,
            path: res.data.path,
            title: "",
            link: "",
            order: banners.length + uploaded.length,
          });
        }
      }

      if (uploaded.length) {
        setBanners((prev) => [...prev, ...uploaded]);
        toast.success("Banner(s) uploaded successfully");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

const removeBanner = async (index: number) => {
  try {
    const bannerToDelete = banners[index];
    
    // Call API to delete from server
    const res = await deleteBannerImage(bannerToDelete.path);
    
    if (res?.success) {
      // Remove from UI only if server deletion succeeded
      setBanners((prev) => prev.filter((_, i) => i !== index));
      toast.success("Banner removed successfully");
    } else {
      toast.error(res?.message || "Failed to delete banner");
    }
  } catch (error) {
    toast.error("Error deleting banner");
    console.error("Delete error:", error);
  }
};

  /* ================= REORDER ================= */
  const moveBanner = (index: number, dir: "up" | "down") => {
    const newIndex = dir === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const updated = [...banners];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBanners(updated);
  };

  /* ================= EDIT ================= */
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({
      title: banners[index].title || "",
      link: banners[index].link || "",
    });
  };

  const saveEdit = () => {
    if (editingIndex === null) return;

    setBanners((prev) =>
      prev.map((b, i) =>
        i === editingIndex ? { ...b, ...editData } : b
      )
    );

    setEditingIndex(null);
    toast.success("Banner updated");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-0">

        <div className="flex items-center gap-2">
          <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
              {banners.length}/{MAX_BANNERS}
            </span>
          </div>
         
        </div>
      </div>

      {/* Upload Zone - Only show when less than max */}
      {banners.length < MAX_BANNERS && (
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          <div className="relative border-2 sm:border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 text-center bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-900/30 dark:to-gray-900/10 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-30" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center shadow-lg">
                  <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Drag & drop banner images
                </h4>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  Supports JPG, PNG • Max 2MB each • Recommended: 1200×400px
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  disabled={uploading || banners.length >= MAX_BANNERS}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 sm:px-8 shadow-lg shadow-blue-500/20 text-sm sm:text-base"
                >
                  {uploading ? (
                    <>
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Browse Files"
                  )}
                </Button>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
      )}

      {/* Banner Grid */}
      {banners.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 sm:gap-2">
              <Grid3x3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Uploaded Banners ({banners.length})
            </h4>
            
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {banners.map((banner, index) => (
              <div
                key={banner.url + index}
                className="group relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-0.5 sm:hover:-translate-y-1"
              >
                {/* Image Container - Full Display */}
                <div className="relative h-40 sm:h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <Image
                    key={banner.url}
                    src={banner.url}
                    alt="Banner"
                    fill
                    className="object-contain p-2" // Changed from object-cover to object-contain
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/70 text-white text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full">
                    #{index + 1}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg"
                        onClick={() => startEdit(index)}
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg"
                        onClick={() => removeBanner(index)}
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-white/20"
                        onClick={() => moveBanner(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-white/20"
                        onClick={() => moveBanner(index, "down")}
                        disabled={index === banners.length - 1}
                      >
                        <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {editingIndex === index ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">Title</Label>
                        <Input
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="text-sm"
                          placeholder="Enter banner title"
                        />
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5" />
                          Link URL (optional)
                        </Label>
                        <Input
                          value={editData.link}
                          onChange={(e) => setEditData({ ...editData, link: e.target.value })}
                          className="text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="flex-1 text-xs sm:text-sm">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 text-xs sm:text-sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                        {banner.title || `Banner ${index + 1}`}
                      </h5>
                      {banner.link && (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <LinkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="truncate">{banner.link}</span>
                        </a>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Settings className="h-3 w-3" />
                          <span>Position: {index + 1}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs sm:text-sm"
                          onClick={() => startEdit(index)}
                        >
                          <Pencil className="h-3 w-3 mr-1.5" />
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {banners.length === 0 && (
        <div className="text-center py-8 sm:py-12 md:py-16">
          <div className="mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
            No banners uploaded yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-4">
            Upload promotional banners to showcase offers, products, or announcements on your homepage. They'll appear in a beautiful carousel.
          </p>
          <Button
            size="lg"
            className="px-6 sm:px-8 md:px-10 shadow-lg shadow-blue-500/20 text-sm sm:text-base"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Upload Your First Banner
          </Button>
        </div>
      )}
    </div>
  );
};

export default BannersUpload;