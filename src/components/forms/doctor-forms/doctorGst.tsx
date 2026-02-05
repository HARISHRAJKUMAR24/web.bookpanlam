"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import FormInputs from "@/components/form-inputs";
import { GST_PERCENTAGES } from "@/constants";
import { InputField, FormValueProps } from "@/types";

interface Form {
  [key: string]: InputField;
}

const ServiceGst = ({ gstPercentage }: FormValueProps) => {
  const [isDisplayed, setIsDisplayed] = useState(false);

  // 🔁 Sync GST visibility with existing value (edit mode fix)
useEffect(() => {
  setIsDisplayed(
    gstPercentage.value !== null &&
    gstPercentage.value !== "" &&
    gstPercentage.value !== undefined
  );
}, [gstPercentage.value]);


  const inputFields: Form = {
    gstPercentage: {
      type: "select",
      value: gstPercentage.value,
      setValue: gstPercentage.setValue,
      label: "GST Percentage",
      containerClassName: "md:col-span-6",
      options: GST_PERCENTAGES,
      placeholder: "Select GST Percentage",
    },
  };

const handleSwitch = (checked: boolean) => {
  setIsDisplayed(checked);

  if (!checked) {
    gstPercentage.setValue?.(null);
  }
};


  return (
    <div className="bg-white rounded-xl p-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">GST</h3>

          <Switch
            checked={isDisplayed}
            onCheckedChange={handleSwitch}
          />
        </div>

        <p className="text-black/50 text-sm font-medium">
          You can change the GST percentage for this particular service
        </p>
      </div>

      {isDisplayed && (
        <div className="mt-9">
          <FormInputs inputFields={inputFields} />
        </div>
      )}
    </div>
  );
};

export default ServiceGst;
