"use client";
import Step1 from "@/components/steps/register-steps/step1";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import Step2 from "../steps/register-steps/step2";
import Step3 from "../steps/register-steps/step3";
import { registerUser, sendOtp } from "@/lib/api/auth";
import { toast } from "sonner";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [sentOtp, setSentOtp] = useState<string>("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("");
  const [country, setCountry] = useState<string>("IN");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);

  // Check if all required fields in step 3 are filled
  const isStep3Valid = () => {
    return (
      siteName.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      serviceTypeId !== null &&
      isPasswordValid
    );
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (!name) return toast.error("Please enter a name");
      if (!isPossiblePhoneNumber(phone))
        return toast.error("Enter valid phone number");

      handleSendOtp();
    }

    if (step === 2) {
      if (!sentOtp || !otp) {
        return toast.error("Please enter OTP");
      }

      if (otp.trim() !== "111111") {
        return toast.error("Incorrect OTP");
      }

      setStep(3);
    }

    if (step === 3) {
      if (!isStep3Valid()) {
        return toast.error("Please fill all fields correctly");
      }
      handleRegisterUser();
    }
  };

  const handleSendOtp = async () => {
    try {
      const cleanPhone = phone.replace("+91", "").trim();
      const response = await sendOtp({ phone: cleanPhone, unique: true });
      setSentOtp("111111");
      toast.success(response.message);
      setStep(2);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRegisterUser = async () => {
    try {
      const cleanPhone = phone.replace("+91", "").trim();
      const userData = {
        name,
        email,
        phone: cleanPhone,
        country,
        siteName,
        serviceTypeId,
        password,
        otp: "111111",
      };

      const response = await registerUser(userData);
      toast.success(response.message);
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid gap-8">
      {step === 1 && (
        <Step1
          name={{ value: name, setValue: setName }}
          phone={{ value: phone, setValue: setPhone }}
        />
      )}

      {step === 2 && (
        <Step2 otp={{ value: otp, setValue: setOtp }} />
      )}

      {step === 3 && (
        <Step3
          siteName={{ value: siteName, setValue: setSiteName }}
          country={{ value: country, setValue: setCountry }}
          email={{ value: email, setValue: setEmail }}
          password={{ value: password, setValue: setPassword }}
          serviceTypeId={{ value: serviceTypeId, setValue: setServiceTypeId }}
          onValidationChange={setIsPasswordValid}
        />
      )}

      <div className="grid gap-2">
        <Button 
          className="w-full h-12 text-base transition-all"
          onClick={handleSubmit}
          disabled={step === 3 && !isStep3Valid()}
        >
          {step === 1 && "Request OTP"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Create Account"}
        </Button>

        {step > 1 && (
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleBack}
          >
            Back
          </Button>
        )}
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;