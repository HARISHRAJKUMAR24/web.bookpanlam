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
import FormInputs from "@/components/form-inputs";

interface Form {
  [key: string]: InputField;
}

const serviceSEO = ({ metaTitle, metaDescription }: FormValueProps) => {
  const inputFields: Form = {
    metaTitle: {
      type: "text",
      value: metaTitle.value,
      setValue: metaTitle.setValue,
      placeholder: "",
      label: "Meta Title",
    },
    metaDescription: {
      type: "textarea",
      value: metaDescription.value,
      setValue: metaDescription.setValue,
      placeholder: "",
      label: "Meta Description",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <FormInputs inputFields={inputFields} />
    </div>
  );
};

export default serviceSEO;
