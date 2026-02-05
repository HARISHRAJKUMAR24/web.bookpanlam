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

const CouponDate = ({ startDate, endDate }: FormValueProps) => {
  const inputFields: Form = {
    startDate: {
      type: "calendar",
      value: startDate.value,
      setValue: startDate.setValue,
      label: "Start Date",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    endDate: {
      type: "calendar",
      value: endDate.value,
      setValue: endDate.setValue,
      label: "End Date",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5 mb-9">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Coupon Date</h3>
        <p className="text-black/50 text-sm font-medium">
          Select Start Date and End Date
        </p>
      </div>

      <FormInputs inputFields={inputFields} />
    </div>
  );
};

export default CouponDate;
