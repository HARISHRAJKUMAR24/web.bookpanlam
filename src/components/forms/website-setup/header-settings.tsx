"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWebsiteSettings } from "@/lib/api/website-settings";
import { handleToast } from "@/lib/utils";
import { InputField, NavLink, WebsiteSettings } from "@/types";
import { X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  data: WebsiteSettings;
}

interface Form {
  [key: string]: InputField;
}

const HeaderSettings = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

const [navLinks, setNavLinks] = useState<NavLink[]>(data?.navLinks || []);

 const handleSave = async () => {
  setIsLoading(true);

  let isValid = true;

  navLinks.forEach((item) => {
    if (!item.label || !item.link) isValid = false;
  });

  if (!isValid) {
    toast.error("All fields must be filled");
    setIsLoading(false);
    return;
  }

  try {
    const payload = {
      user_id: data.user_id,   // ⭐ REQUIRED
      navLinks,
    };

    const response = await saveWebsiteSettings(payload);

    handleToast(response);
  } catch (error: any) {
    toast.error(error.message);
  }

  setIsLoading(false);
};


  const handleUpdateValue = (
    index: number,
    data: { [key: string]: string }
  ) => {
    setNavLinks((prev) => {
      const updatedItems = [...prev];
      updatedItems[index] = { ...updatedItems[index], ...data };
      return updatedItems;
    });
  };

  const handleAddNew = () => {
    setNavLinks((prev) => [...prev, { label: "", link: "" }]);
  };

  const handleRemove = (index: number) => {
    setNavLinks((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <>
      <div className="grid gap-6">
        <div>
          <Label className="mb-3 block">Nav Links</Label>
          <div className="grid gap-3">
            {navLinks?.map((item, index) => (
              <div
                key={index}
                className="sm:flex items-center justify-between gap-3"
              >
                <div className="grid sm:grid-cols-2 gap-3 sm:w-[95%]">
                  <Input
                    type="text"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) =>
                      handleUpdateValue(index, { label: e.target.value })
                    }
                  />
                  <Input
                    type="url"
                    placeholder="Link with http:// or https://"
                    value={item.link}
                    onChange={(e) =>
                      handleUpdateValue(index, { link: e.target.value })
                    }
                  />
                </div>

                <div className="sm:w-[5%] flex items-center justify-end mt-1 sm:mt-0">
                  <Button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="text-red-500 bg-red-500/10 sm:w-10 h-10 px-3 sm:px-0 rounded-full flex items-center justify-center gap-0.5 hover:bg-red-500 hover:text-white"
                  >
                    <X />
                    <span className="sm:hidden">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={handleAddNew}
          >
            Add New
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-end mt-6">
        <Button onClick={handleSave} disabled={isLoading} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default HeaderSettings;
