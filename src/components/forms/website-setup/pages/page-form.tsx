"use client";
import FormInputs from "@/components/form-inputs";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/hooks/useCurrentUser";
import { addPage, updatePage } from "@/lib/api/website-pages";
import { generateRandomNumbers, handleToast } from "@/lib/utils";
import { PageFormProps, InputField } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Form {
  [key: string]: InputField;
}

const PageForm = ({ isEdit, data }: PageFormProps) => {
  const router = useRouter();

  const { userData } = useCurrentUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>(data?.name as string);
  const [slug, setSlug] = useState<string>(data?.slug as string);
  const [content, setContent] = useState<string>(data?.content as string);

  const inputFields: Form = {
    name: {
      type: "text",
      value: name,
      setValue: setName,
      label: "Name",
      placeholder: "Name",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    slug: {
      type: "text",
      value: slug,
      setValue: setSlug,
      label: (
        <>
          Service Slug <small className="text-black/50">(optional)</small>
        </>
      ),
      placeholder: "Slug",
      containerClassName: "col-span-12 md:col-span-6",
    },
    content: {
      type: "editor",
      value: content,
      setValue: setContent,
      label: "Content",
    },
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const formData = {
        user_id: userData?.id,                     // required by DB
        page_id: crypto.randomUUID(),             // required unique ID
        name,
        slug,
        content,
      };


      const response = !isEdit
        ? await addPage(formData)
        : await updatePage(data?.pageId as string, formData);
      handleToast(response);

      if (response.success && !isEdit) {
        setName("");
        setSlug("");
        setContent("");
        router.push("?" + generateRandomNumbers(1, 9));
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <FormInputs inputFields={inputFields} />

      <div className="flex items-center justify-end mt-6">
        <Button onClick={handleSave} disabled={isLoading} isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PageForm;
