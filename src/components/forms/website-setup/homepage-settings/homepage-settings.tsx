"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import FormInputs from "@/components/form-inputs";
import { Button } from "@/components/ui/button";
import { saveWebsiteSettings } from "@/lib/api/website-settings";
import { handleToast } from "@/lib/utils";
import { InputField, WebsiteSettings } from "@/types";
import { uploadsUrl } from "@/config"; // 🔥 REQUIRED
import { Banner } from "@/types";

import HeroImageUpload from "./hero-image-upload";
import BannersUpload from "./banners-upload";


interface Props {
  data: WebsiteSettings | null;
    userId: number;   // ⭐ ADD THIS

  
}

interface Form {
  [key: string]: InputField;
}

/* ---------------- COMPONENT ---------------- */

const HomepageSettings = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImage, setHeroImage] = useState({ url: "", path: "" });
  const [banners, setBanners] = useState<Banner[]>([]);

  // ⭐ prevents re-hydration overwrite
  const hydratedRef = useRef(false);

  /* ---------- INITIAL DATA SYNC ---------- */
  useEffect(() => {
    if (!data || hydratedRef.current) return;

    console.log("🟢 INITIAL FETCH DATA →", data);

    /* ---------- HERO ---------- */
    setHeroTitle(data.heroTitle ?? "");
    setHeroDescription(data.heroDescription ?? "");

    setHeroImage({
url: data.heroImage ? `${uploadsUrl}/${data.heroImage}` : "",
      path: data.heroImage ?? "",
    });

    /* ---------- 🔥 BANNERS FIX ---------- */
    if (Array.isArray(data.banners)) {
      const normalizedBanners: Banner[] = data.banners.map((b: any) => {
        // backend stores: seller/USER_ID/...
        // uploadsUrl already ends with /uploads
        const previewPath = b.path.replace(/^seller\//, "");

        return {
          ...b,
          url: `${uploadsUrl}/${previewPath}`, // ✅ rebuild URL
        };
      });

      setBanners(normalizedBanners);
    } else {
      setBanners([]);
    }

    hydratedRef.current = true;
  }, [data]);

  /* ---------- FORM CONFIG ---------- */
  const inputFields: Form = {
    hero_title: {
      type: "text",
      value: heroTitle,
      setValue: setHeroTitle,
      label: "Hero Title",
    },
    hero_description: {
      type: "textarea",
      value: heroDescription,
      setValue: setHeroDescription,
      label: "Hero Description",
      rows: 5,
    },
  };

  /* ---------- SAVE ---------- */
  const handleSave = async () => {
    if (banners.length > 5) {
      toast.error("Maximum 5 banners allowed");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        hero_title: heroTitle,
        hero_description: heroDescription,
        hero_image: heroImage.path, // ✅ DB path
        banners: banners.map((b, i) => ({
          path: b.path,             // ✅ DB path only
          title: b.title ?? "",
          link: b.link ?? "",
          order: i,
        })),
      };

      console.log("🟡 SAVE PAYLOAD →", payload);

      const response = await saveWebsiteSettings(payload);

      console.log("🟢 SAVE RESPONSE →", response);

      handleToast(response);
    } catch (err) {
      console.error("🔥 SAVE ERROR →", err);
      toast.error("Failed to save homepage settings");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border">
        <FormInputs inputFields={inputFields} />
        <HeroImageUpload value={heroImage} setValue={setHeroImage} />
      </div>

      {/* BANNERS */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Homepage Banners</h3>
          <span className="text-sm text-muted-foreground">
            {banners.length}/5
          </span>
        </div>

        <BannersUpload banners={banners} setBanners={setBanners} />
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default HomepageSettings;
