"use client";
import FormInputs from "@/components/form-inputs";
import { Button } from "@/components/ui/button";
import { getSocialSettings, updateSocialSettings } from "@/lib/api/social-settings";
import { InputField } from "@/types";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface SocialSettingsData {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;
}

interface Form {
  [key: string]: InputField;
}

const SocialSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SocialSettingsData>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    pinterest: ""
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getSocialSettings();

      if (response?.success && response.data) {
        const data = response.data;
        setSettings({
          facebook: data.facebook || "",
          twitter: data.twitter || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          youtube: data.youtube || "",
          pinterest: data.pinterest || ""
        });
      }
    } catch (error) {
      console.error("Failed to load social settings:", error);
      toast.error("Failed to load social settings");
    }
    setIsLoading(false);
  };

  const inputFields: Form = {
    facebook: {
      type: "url",
      value: settings.facebook || "",
      setValue: (value) => setSettings(prev => ({ ...prev, facebook: value })),
      label: "Facebook",
      placeholder: "https://facebook.com/username",
      containerClassName: "md:col-span-6",
    },
    twitter: {
      type: "url",
      value: settings.twitter || "",
      setValue: (value) => setSettings(prev => ({ ...prev, twitter: value })),
      label: "Twitter",
      placeholder: "https://twitter.com/username",
      containerClassName: "md:col-span-6",
    },
    instagram: {
      type: "url",
      value: settings.instagram || "",
      setValue: (value) => setSettings(prev => ({ ...prev, instagram: value })),
      label: "Instagram",
      placeholder: "https://instagram.com/username",
      containerClassName: "md:col-span-6",
    },
    linkedin: {
      type: "url",
      value: settings.linkedin || "",
      setValue: (value) => setSettings(prev => ({ ...prev, linkedin: value })),
      label: "LinkedIn",
      placeholder: "https://linkedin.com/in/username",
      containerClassName: "md:col-span-6",
    },
    youtube: {
      type: "url",
      value: settings.youtube || "",
      setValue: (value) => setSettings(prev => ({ ...prev, youtube: value })),
      label: "YouTube",
      placeholder: "https://youtube.com/c/channelname",
      containerClassName: "md:col-span-6",
    },
    pinterest: {
      type: "url",
      value: settings.pinterest || "",
      setValue: (value) => setSettings(prev => ({ ...prev, pinterest: value })),
      label: "Pinterest",
      placeholder: "https://pinterest.com/username",
      containerClassName: "md:col-span-6",
    },
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateSocialSettings({
        facebook: settings.facebook?.trim() || "",
        twitter: settings.twitter?.trim() || "",
        instagram: settings.instagram?.trim() || "",
        linkedin: settings.linkedin?.trim() || "",
        youtube: settings.youtube?.trim() || "",
        pinterest: settings.pinterest?.trim() || ""
      });

      if (response.success) {
        toast.success("Social settings saved successfully");
        await loadSettings(); // Refresh data
      } else {
        toast.error(response.message || "Failed to save social settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading social settings...</div>;
  }

  return (
    <div className="bg-white rounded-xl p-5">

      <FormInputs inputFields={inputFields} />

      <div className="flex items-center justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          isLoading={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Social Settings
        </Button>
      </div>
    </div>
  );
};

export default SocialSettings;