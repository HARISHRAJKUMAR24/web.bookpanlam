"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getCookie } from "cookies-next";

import { Button } from "@/components/ui/button";
import { changePassword } from "@/lib/api/users";
import { handleToast } from "@/lib/utils";
import { InputField, User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  user: User | null;
}

interface Form {
  [key: string]: InputField;
}

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

const ChangePassword = ({ user }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      met: req.test(password),
    }));

    const metCount = requirements.filter((req) => req.met).length;
    const isValid = metCount === PASSWORD_REQUIREMENTS.length;

    setPasswordStrength({
      isValid,
      score: metCount,
      requirements,
    });
  }, [password]);

  // Get strength color
  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const inputFields: Form = {
    currentPassword: {
      type: showCurrentPassword ? "text" : "password",
      value: currentPassword,
      setValue: setCurrentPassword,
      label: "Current Password",
      placeholder: "Enter current password",
      containerClassName: "md:col-span-12",
    },
    password: {
      type: showNewPassword ? "text" : "password",
      value: password,
      setValue: setPassword,
      label: "New Password",
      placeholder: "Enter new password",
      containerClassName: "md:col-span-6",
    },
    confirmPassword: {
      type: showConfirmPassword ? "text" : "password",
      value: confirmPassword,
      setValue: setConfirmPassword,
      label: "Confirm Password",
      placeholder: "Confirm new password",
      containerClassName: "md:col-span-6",
    },
  };

  const handleSave = async () => {
    // ✅ Basic validation
    if (!currentPassword || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    // ✅ Get token from cookies (CLIENT SIDE)
    const token = getCookie("token") as string;

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        currentPassword,
        password,
        token,
      });

      handleToast(response);

      if (response?.success) {
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Render custom input with eye icon
  const renderPasswordInput = (
    field: InputField,
    value: string,
    setValue: (val: string) => void,
    showPassword: boolean,
    setShowPassword: (val: boolean) => void,
    onFocus?: () => void,
    onBlur?: () => void,
    customClassName?: string
  ) => (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={`w-full h-12 px-4 text-base rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${customClassName || ""}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {/* Current Password */}
        <div className="md:col-span-12">
          <label className="text-sm font-medium mb-1 block">
            {inputFields.currentPassword.label}
          </label>
          {renderPasswordInput(
            inputFields.currentPassword,
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            setShowCurrentPassword
          )}
        </div>

        {/* New Password */}
        <div className="md:col-span-6">
          <label className="text-sm font-medium mb-1 block">
            {inputFields.password.label}
          </label>
          {renderPasswordInput(
            inputFields.password,
            password,
            setPassword,
            showNewPassword,
            setShowNewPassword,
            () => setIsNewPasswordFocused(true),
            () => setIsNewPasswordFocused(false),
            password && !passwordStrength.isValid
              ? "border-red-300 focus-visible:ring-red-200"
              : password && passwordStrength.isValid
                ? "border-green-300 focus-visible:ring-green-200"
                : ""
          )}

          {/* Password strength indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <div className="flex gap-1 h-1.5">
                {PASSWORD_REQUIREMENTS.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex-1 h-full rounded-full transition-colors ${index < passwordStrength.score
                        ? getStrengthColor()
                        : "bg-gray-200"
                      }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Password requirements checklist */}
          <AnimatePresence>
            {(isNewPasswordFocused || password) && (
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
                          className={`text-xs ${req.met ? "text-green-600" : "text-gray-500"
                            }`}
                        >
                          {req.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

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

        {/* Confirm Password */}
        <div className="md:col-span-6">
          <label className="text-sm font-medium mb-1 block">
            {inputFields.confirmPassword.label}
          </label>
          {renderPasswordInput(
            inputFields.confirmPassword,
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            undefined,
            undefined,
            confirmPassword && password !== confirmPassword
              ? "border-red-300 focus-visible:ring-red-200"
              : confirmPassword && password === confirmPassword
                ? "border-green-300 focus-visible:ring-green-200"
                : ""
          )}

          {/* Confirm password match indicator */}
          {confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1 text-xs"
            >
              {password === confirmPassword ? (
                <span className="text-green-600">✓ Passwords match</span>
              ) : (
                <span className="text-red-500">✗ Passwords do not match</span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={isLoading || (password !== "" && !passwordStrength.isValid)}
          isLoading={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
};

export default ChangePassword;