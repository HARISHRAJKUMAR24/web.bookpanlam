import { InputField, FormValueProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import FormInputs from "@/components/form-inputs";

interface Form {
  [key: string]: InputField;
}

const UsageLimit = ({ usageLimit }: FormValueProps) => {
  const [isDisplayed, setIsDisplayed] = useState<boolean>(
    usageLimit.value ? true : false
  );

  const inputFields: Form = {
    usageLimit: {
      type: "number",
      value: usageLimit.value,
      setValue: usageLimit.setValue,
      placeholder: "Enter limit",
      label: "Usage Limit",
    },
  };

  const handleSwitch = () => {
    isDisplayed === true && usageLimit.setValue && usageLimit.setValue(null);

    setIsDisplayed(!isDisplayed);
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Usage Limit</h3>

          <Switch
            onClick={handleSwitch}
            defaultChecked={usageLimit.value ? true : false}
          />
        </div>
      </div>

      {isDisplayed && (
        <div className="mt-9">
          <FormInputs inputFields={inputFields} />
        </div>
      )}
    </div>
  );
};

export default UsageLimit;
