"use client";
import FormInputs from "@/components/form-inputs";
import { COUNTRIES } from "@/constants";
import { InputField, FormValueProps } from "@/types";

interface Form {
  [key: string]: InputField;
}

const Step3 = ({ newPassword, confirmPassword }: FormValueProps) => {
  const inputFields: Form = {
    password: {
      type: "password",
      value: newPassword.value,
      placeholder: "********",
      label: "New Password",
      setValue: newPassword.setValue,
    },
    confirmPassword: {
      type: "password",
      value: confirmPassword.value,
      placeholder: "********",
      label: "Confirm Password",
      setValue: confirmPassword.setValue,
    },
  };

  return <FormInputs inputFields={inputFields} />;
};

export default Step3;
