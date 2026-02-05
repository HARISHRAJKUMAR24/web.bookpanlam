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
import { DISCOUNT_TYPE } from "@/constants";
import FormInputs from "@/components/form-inputs";

interface Form {
  [key: string]: InputField;
}

const CouponInformation = ({
  name,
  code,
  discountType,
  discount,
}: FormValueProps) => {
  const inputFields: Form = {
    name: {
      type: "text",
      value: name.value,
      setValue: name.setValue,
      placeholder: "Enter coupon name",
      label: "Coupon Name",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    code: {
      type: "text",
      value: code.value,
      setValue: code.setValue,
      placeholder: "Enter coupon code",
      label: "Coupon Code",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    discountType: {
      type: "select",
      value: discountType.value,
      setValue: discountType.setValue,
      label: "Discount Type",
      options: DISCOUNT_TYPE,
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
    discount: {
      type: "number",
      value: discount.value,
      setValue: discount.setValue,
      placeholder: "Enter discount amount",
      label: "Discount",
      required: true,
      containerClassName: "col-span-12 md:col-span-6",
    },
  };

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Coupon Information</h3>
        <p className="text-black/50 text-sm font-medium">
          Easily input essential details like coupon name, coupon code, and more
          to showcase your coupon.
        </p>
      </div>

      <FormInputs inputFields={inputFields} />
    </div>
  );
};

export default CouponInformation;
