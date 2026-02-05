"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { forgotPassword, sendOtp } from "@/lib/api/auth";
import Step1 from "../steps/forgot-password/step1";
import Step2 from "../steps/forgot-password/step2";
import Step3 from "../steps/forgot-password/step3";
import Success from "../steps/forgot-password/success";

const ForgotPasswordForm = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState<string>("");
  const [sentOtp, setSentOtp] = useState<string>("");

  const handleBack = () => {
    setStep((current) => current - 1);
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (!phone) return toast.error("Phone number is required");

      if (!isPossiblePhoneNumber(phone))
        return toast.error("Please enter a valid phone number");

      // Send OTP
      handleSendOtp();
    }

    if (step === 2) {
      if (parseInt(sentOtp) !== parseInt(otp))
        return toast.error("Please enter correct OTP");

      setStep(3);
    }

    if (step === 3) {
      if (newPassword !== confirmPassword)
        return toast.error("Passwords do not match");

      handleChangePassword();
    }
  };

  // Send OTP request to the server
  const handleSendOtp = async () => {
    try {
      const response = await sendOtp({ phone, registered: true });

      setSentOtp(response.otp);
      setStep(2);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Forgot password request to the server
  const handleChangePassword = async () => {
    try {
      const response = await forgotPassword({
        user: phone,
        password: newPassword,
      });

      toast.success(response.message);
      setStep(0);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      {step !== 0 && (
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email or phone number below to continue
          </p>
        </div>
      )}

      <div className="grid gap-8">
        {step === 1 ? (
          <Step1 phone={{ value: phone, setValue: setPhone }} />
        ) : step === 2 ? (
          <Step2 otp={{ value: otp, setValue: setOtp }} />
        ) : step === 3 ? (
          <Step3
            newPassword={{ value: newPassword, setValue: setNewPassword }}
            confirmPassword={{
              value: confirmPassword,
              setValue: setConfirmPassword,
            }}
          />
        ) : (
          <Success />
        )}

        {step !== 0 && (
          <div className="grid gap-2">
            <Button
              type="submit"
              className="w-full h-12 text-base"
              onClick={handleSubmit}
            >
              {step === 1
                ? "Request OTP"
                : step == 2
                ? "Verify OTP Code"
                : step === 3
                ? "Change Password"
                : null}
            </Button>

            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ForgotPasswordForm;
