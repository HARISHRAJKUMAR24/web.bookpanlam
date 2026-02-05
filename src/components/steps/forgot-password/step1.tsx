import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/ui/phone-input";
import { FormValueProps } from "@/types";

const Step1 = ({ phone }: FormValueProps) => {
  return (
    <div className="grid gap-3">
      <Label>Phone Number</Label>
      <PhoneInput
        placeholder="Phone Number"
        value={phone.value}
        onChange={(value: string) => {
          phone.setValue && phone.setValue(value);
        }}
        className="h-12 px-4 [&_input]:!text-base"
        autoFocus={true}
      />
    </div>
  );
};

export default Step1;
