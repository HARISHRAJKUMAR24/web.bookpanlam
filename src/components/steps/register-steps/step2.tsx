"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { FormValueProps } from "@/types";

const Step2 = ({ otp }: FormValueProps) => {
  return (
    <div className="grid gap-3">
      <Label>One-Time Password</Label>

      <InputOTP
        containerClassName="[&>div]:justify-between [&>div]:w-full"
        maxLength={6}
        value={otp.value}
        onChange={(value: string) => otp.setValue && otp.setValue(value)}
      >
        <InputOTPGroup>
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={0}
          />
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={1}
          />
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={2}
          />
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={3}
          />
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={4}
          />
          <InputOTPSlot
            className="w-12 h-12 border rounded-md text-base"
            index={5}
          />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-sm">
        Please enter the one-time password sent to your phone.
      </p>
    </div>
  );
};

export default Step2;
