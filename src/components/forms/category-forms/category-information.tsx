"use client";

import { InputField } from "@/types";
import FormInputs from "@/components/form-inputs";

interface SingleFormValue {
  value: any;
  setValue?: (value: any) => void;
}

interface CategoryInformationProps {
  name: SingleFormValue;
  slug: SingleFormValue;
  hsnCode: SingleFormValue; // HSN supports same {value, setValue}
}

const CategoryInformation = ({ name, slug, hsnCode }: CategoryInformationProps) => {
  const inputFields: Record<string, InputField> = {
    name: {
      type: "text",
      value: name.value,
      setValue: name.setValue,
      placeholder: "Enter category name",
      label: "Category Name",
      required: true,
      containerClassName: "col-span-12",
    },

    slug: {
      type: "text",
      value: slug.value,
      setValue: slug.setValue,
      placeholder: "Enter category slug",
      label: (
        <>
          Category Slug <small className="text-black/50">(optional)</small>
        </>
      ),
      containerClassName: "col-span-12",
    },

    hsnCode: {
      type: "text",
      value: hsnCode.value ?? "",
      setValue: hsnCode.setValue ?? (() => {}),
      placeholder: "Enter HSN code for GST",
      label: (
        <>
          HSN Code <small className="text-black/50">(optional)</small>
        </>
      ),
      containerClassName: "col-span-12",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Category Information</h3>
        <p className="text-black/50 text-sm font-medium">
          Easily input essential details like name, slug, and HSN code to showcase your category.
        </p>
      </div>

      <FormInputs inputFields={inputFields} />
    </div>
  );
};

export default CategoryInformation;
