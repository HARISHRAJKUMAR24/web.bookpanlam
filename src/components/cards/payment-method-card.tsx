"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadsUrl } from "@/config";
import { Switch } from "@/components/ui/switch";
import { PaymentMethodCardProps } from "@/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PaymentMethodCard = ({
  name,
  method,
  inputFields,
  showEnableSwitch = false,
  enabled = false,
  onToggle,
}: PaymentMethodCardProps & {
  showEnableSwitch?: boolean;
  enabled?: boolean;
  onToggle?: (value: boolean) => void;
}) => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Initialize field values from props
  useEffect(() => {
    if (!inputFields) {
      setFieldValues({});
      return;
    }

    const values: Record<string, string> = {};
    Object.keys(inputFields).forEach((key) => {
      values[key] = String(inputFields[key].value ?? "");
    });

    setFieldValues(values);
  }, [inputFields]);

  
  // Check if the gateway is configured
  const isConfigured = () => {
    if (!inputFields || Object.keys(inputFields).length === 0) {
      return true; // For cash, no fields means configured
    }
    
    return Object.keys(inputFields).every(
      (key) => fieldValues[key] && fieldValues[key].trim() !== ""
    );
  };

  const isPartiallyConfigured = () => {
    if (!inputFields || Object.keys(inputFields).length === 0) return false;
    
    const keys = Object.keys(inputFields);
    const filled = keys.filter((key) => fieldValues[key] && fieldValues[key].trim() !== "").length;
    return filled > 0 && filled < keys.length;
  };

  const handleFieldChange = (fieldName: string, newValue: string) => {
    // Update local state
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    // IMPORTANT: Call parent's setValue function to update parent state
if (inputFields && inputFields[fieldName] && inputFields[fieldName].setValue) {
      inputFields?.[fieldName]?.setValue?.(newValue);

    }
  };

  const toggleSecretVisibility = (fieldName: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const getGatewayStatus = () => {
    if (showEnableSwitch && !enabled) return "disabled";
    if (isConfigured()) return "configured";
    if (isPartiallyConfigured()) return "partial";
    return "enabled";
  };

  const status = getGatewayStatus();

  return (
    <Card
      className={`overflow-hidden border-2 transition-all duration-300 ${
        status === "configured"
          ? `border-blue-200 bg-gradient-to-br from-blue-50 to-white`
          : status === "partial"
          ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
          : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`p-3 rounded-xl ${
                status === "configured"
                  ? `bg-blue-100`
                  : status === "partial"
                  ? "bg-amber-100"
                  : "bg-gray-100"
              }`}
            >
              <Image
                src={`${uploadsUrl}/static/${method.icon}`}
                alt={method.name}
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                {method.name}
                {status === "configured" && (
                  <CheckCircle2 className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600`} />
                )}
                {status === "partial" && (
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                )}
              </CardTitle>
            </div>
          </div>

          {showEnableSwitch && onToggle && (
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-xs text-gray-500 font-medium">
                {enabled ? "ON" : "OFF"}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Configuration Fields - Always show when there are input fields */}
      {inputFields && Object.keys(inputFields).length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-5">
              {Object.keys(inputFields).map((key) => {
                const field = inputFields[key];
                const isPassword = field.type === "password";
                const isVisible = showSecrets[key] || false;

                return (
                  <div key={key} className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                      <Label htmlFor={key} className="font-medium text-gray-700 text-sm sm:text-base">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      {field.description && (
                        <span className="text-xs text-gray-500">
                          {field.description}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                  {isPassword ? (
                        <Input
                          id={key}
                          name={`${key}-field`}
                          type={isVisible ? "text" : "password"}
                          autoComplete="new-password"
                          value={fieldValues[key] || ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          placeholder={field.placeholder}
                          className="pr-10 text-sm sm:text-base"
                        />
                      ) : (
                        <Input
                          id={key}
                          name={`${key}-field`}
                          autoComplete="off"
                          type={field.type}
                          value={fieldValues[key] || ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                          placeholder={field.placeholder}
                          className="text-sm sm:text-base"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}

      {/* Status Info */}
      {status === "configured" && inputFields && Object.keys(inputFields).length > 0 && (
        <CardContent className="pt-0">
          <div className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {Object.keys(inputFields).map((key) => {
                const field = inputFields[key];
                const value = fieldValues[key];

                if (!value || value.trim() === "") return null;

                return (
                  <div key={key} className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-2 h-2 rounded-full bg-blue-600`}></div>
                      <p className="text-xs text-gray-500 font-medium">{field.label}</p>
                    </div>
                    <div className="pl-3 sm:pl-4">
                      <p className="text-xs sm:text-sm font-medium truncate bg-gray-50 p-1.5 sm:p-2 rounded border">
                        {field.type === "password"
                          ? "••••••••••••••••"
                          : value.length > 25
                          ? `${value.substring(0, 25)}...`
                          : value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PaymentMethodCard;