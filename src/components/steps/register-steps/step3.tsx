"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/constants";
import { InputField } from "@/types";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Form {
  [key: string]: InputField;
}

/**
 * SERVICE TYPES
 * IDs MUST match DB IDs
 */
const SERVICE_TYPES = [
  { label: "Hospital", value: "1" },
  { label: "Hotel", value: "2" },
  { label: "Others", value: "3" },
];

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    label: "At least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "At least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "At least one number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: "At least one special character (!@#$%^&*)",
    test: (password) => /[!@#$%^&*]/.test(password),
  },
];

interface Step3Props {
  siteName: { value: string; setValue: (value: string) => void };
  country: { value: string; setValue: (value: string) => void };
  email: { value: string; setValue: (value: string) => void };
  password: { value: string; setValue: (value: string) => void };
  serviceTypeId: { value: number | null; setValue: (value: number) => void };
  onValidationChange?: (isValid: boolean) => void;
}

const Step3 = ({
  siteName,
  country,
  email,
  password,
  serviceTypeId,
  onValidationChange,
}: Step3Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    score: number;
    requirements: { label: string; met: boolean }[];
  }>({
    isValid: false,
    score: 0,
    requirements: PASSWORD_REQUIREMENTS.map((req) => ({
      label: req.label,
      met: false,
    })),
  });

  // Validate password whenever it changes
  useEffect(() => {
    const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
      label: req.label,
      met: req.test(password.value),
    }));

    const metCount = requirements.filter((req) => req.met).length;
    const isValid = metCount === PASSWORD_REQUIREMENTS.length;

    setPasswordStrength({
      isValid,
      score: metCount,
      requirements,
    });

    // Notify parent component about validation status
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [password.value, onValidationChange]);

  // Get strength color
  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const inputFields: Form = {
    serviceTypeId: {
      type: "select",
      value: serviceTypeId?.value ? String(serviceTypeId.value) : "",
      label: "Service Type",
      placeholder: "Select service type",
      options: SERVICE_TYPES,
      setValue: () => {},
    },
    siteName: {
      type: "text",
      value: siteName.value,
      placeholder: "Auto Care",
      label: "Site Name",
      setValue: siteName.setValue,
    },
    country: {
      type: "select",
      value: country.value,
      label: "Country",
      setValue: country.setValue,
      options: COUNTRIES as any,
      placeholder: "Select country",
    },
    email: {
      type: "email",
      value: email.value,
      placeholder: "name@domain.com",
      label: "Email Address",
      setValue: email.setValue,
    },
    password: {
      type: showPassword ? "text" : "password",
      value: password.value,
      placeholder: "********",
      label: "Password",
      setValue: password.setValue,
    },
  };

  return (
    <>
      {Object.keys(inputFields).map((key, index) => {
        const field = inputFields[key];

        if (field.type === "select") {
          return (
            <div key={index} className="grid gap-3">
              <Label>{field.label}</Label>

              <Select
                value={field.value as string}
                onValueChange={(value) => {
                  if (key === "serviceTypeId") {
                    serviceTypeId.setValue(Number(value));
                  } else {
                    field.setValue && field.setValue(value);
                  }
                }}
              >
                <SelectTrigger className="w-full h-12 text-base px-4">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>

                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.type === "textarea") {
          return (
            <div key={index} className="grid gap-3">
              <Label>{field.label}</Label>
              <Textarea
                placeholder={field.placeholder}
                value={field.value as string}
                onChange={(e) =>
                  field.setValue && field.setValue(e.target.value)
                }
                className="text-base"
              />
            </div>
          );
        }

        if (field.type === "phone") {
          return (
            <div key={index} className="grid gap-3">
              <Label>{field.label}</Label>
              <PhoneInput
                placeholder={field.placeholder}
                value={field.value}
                onChange={field.setValue}
                className="h-12 px-4 [&_input]:text-base"
              />
            </div>
          );
        }

        // Special handling for password field with validation
        if (key === "password") {
          return (
            <div key={index} className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>{field.label}</Label>
              </div>

              <div className="relative">
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value as string}
                  onChange={(e) =>
                    field.setValue && field.setValue(e.target.value)
                  }
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`h-12 px-4 text-base pr-10 transition-all ${
                    password.value && !passwordStrength.isValid
                      ? "border-red-300 focus-visible:ring-red-200"
                      : password.value && passwordStrength.isValid
                      ? "border-green-300 focus-visible:ring-green-200"
                      : ""
                  }`}
                />

              </div>

              {/* Password strength indicator bar */}
              {password.value && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1"
                >
                  <div className="flex gap-1 h-1.5">
                    {PASSWORD_REQUIREMENTS.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex-1 h-full rounded-full transition-colors ${
                          index < passwordStrength.score
                            ? getStrengthColor()
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Password requirements checklist - clean version without icons */}
              <AnimatePresence>
                {(isFocused || password.value) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Password must contain:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {passwordStrength.requirements.map((req, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2"
                          >
                            <span
                              className={`text-xs ${
                                req.met ? "text-green-600" : "text-gray-500"
                              }`}
                            >
                              {req.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Simple success message */}
                      {passwordStrength.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-xs text-green-600"
                        >
                          ✓ Password meets all requirements
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div key={index} className="grid gap-3">
            <Label>{field.label}</Label>
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={field.value as string}
              onChange={(e) =>
                field.setValue && field.setValue(e.target.value)
              }
              className="h-12 px-4 text-base"
            />
          </div>
        );
      })}
    </>
  );
};

export default Step3;