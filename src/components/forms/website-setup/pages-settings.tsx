"use client";
import FormInputs from "@/components/form-inputs";
import { Button } from "@/components/ui/button";
import { saveWebsiteSettings } from "@/lib/api/website-settings";
import { handleToast } from "@/lib/utils";
import { InputField, WebsiteSettings } from "@/types";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: WebsiteSettings;
}

interface Form {
  [key: string]: InputField;
}

const PagesSettings = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const [heroTitle, setHeroTitle] = useState<string>(data?.heroTitle);
  const [heroDescription, setHeroDescription] = useState<string>(
    data?.heroDescription
  );
  const [heroImage, setHeroImage] = useState<string>(data?.heroImage);

  const inputFields: Form = {
    heroTitle: {
      type: "text",
      value: heroTitle,
      setValue: setHeroTitle,
      label: "Hero Title",
    },
    heroDescription: {
      type: "textarea",
      value: heroDescription,
      setValue: setHeroDescription,
      label: "Hero Description",
      rows: 5,
    },
    heroImage: {
      type: "file",
      value: heroImage,
      setValue: setHeroImage,
      label: "Hero Image",
    },
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const data = {
        heroTitle,
        heroDescription,
        heroImage,
      };

      const response = await saveWebsiteSettings(data);

      handleToast(response);
    } catch (error: any) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <>
      <FormInputs inputFields={inputFields} />

      <div className="flex items-center justify-end mt-6">
        <Button onClick={handleSave} disabled={isLoading} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default PagesSettings;
