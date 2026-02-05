"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadsUrl } from "@/config";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/api/site-settings";
import { handleToast } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentMethodCardProps } from "@/types";
import useCurrentUser from "@/hooks/useCurrentUser";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Settings,
  Shield,
  Key,
  Lock,
  ArrowRight,
  Info,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PaymentMethodCard = ({
  name,
  value,
  method,
  inputFields,
}: PaymentMethodCardProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { userData } = useCurrentUser();
  const [hydrated, setHydrated] = useState(false);
  const [localEnabled, setLocalEnabled] = useState<boolean | null>(null);

  // Initialize localEnabled from value prop
  useEffect(() => {
    if (typeof value?.value === "boolean") {
      setLocalEnabled(value.value);
    }
  }, [value?.value]);

  // Initialize field values when inputFields changes
  useEffect(() => {
    if (!inputFields) return;

    const values: Record<string, string> = {};
    Object.keys(inputFields).forEach((key) => {
      values[key] = String(inputFields[key].value ?? "");
    });

    setFieldValues(values);
    setHydrated(true);
  }, [inputFields]);

  // Initialize state for input fields
  const initializeFieldValues = () => {
    const values: Record<string, string> = {};
    if (inputFields) {
      Object.keys(inputFields).forEach((key) => {
        values[key] = inputFields[key].value as string;
      });
    }
    return values;
  };

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    initializeFieldValues()
  );

  // Sync field values when DB data arrives
  useEffect(() => {
    if (!inputFields) return;

    const values: Record<string, string> = {};
    Object.keys(inputFields).forEach((key) => {
      values[key] = String(inputFields[key].value ?? "");
    });

    setFieldValues(values);
  }, [inputFields]);

  // Check if the gateway is configured (has non-empty values)
  const isConfigured = () => {
    if (!inputFields) return false;
    return Object.keys(inputFields).every(
      (key) => fieldValues[key] && fieldValues[key].trim() !== ""
    );
  };

  const isPartiallyConfigured = () => {
    if (!inputFields) return false;
    const keys = Object.keys(inputFields);
    const filled = keys.filter((key) => fieldValues[key] && fieldValues[key].trim() !== "").length;
    return filled > 0 && filled < keys.length;
  };

  const handleSwitch = async () => {
    if (!name) return;

    const newValue = !localEnabled;

    // Optimistic UI update
    setLocalEnabled(newValue);

    const payload: Record<string, any> = {
      [name]: newValue,
    };

    try {
      const response = await updateSiteSettings(payload);
      handleToast(response);

      toast.success(
        newValue ? `${method.name} enabled` : `${method.name} disabled`,
        {
          description: newValue
            ? "Payment method is now active"
            : "Payment method is now inactive",
        }
      );

      if (!newValue) {
        // When disabling, hide inputs but don't clear data
        setShowInputs(false);
      } else {
        // When enabling, show inputs if not configured
        if (!isConfigured()) {
          setShowInputs(true);
        }
      }
    } catch (error: any) {
      // Rollback on failure
      setLocalEnabled(!newValue);
      toast.error(error.message || "Update failed");
    }
  };

  const handleFieldChange = (fieldName: string, newValue: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleSave = async () => {
    if (!inputFields) return;

    const payload: Record<string, any> = {};

    Object.keys(inputFields).forEach((key) => {
      payload[key] = fieldValues[key] || "";
    });

    console.log("📦 SENDING PAYLOAD:", payload);

    setIsSaving(true);

    try {
      const response = await updateSiteSettings(payload);

      if (!response?.success) {
        toast.error(response?.message || "Failed to save payment settings");
        return;
      }

      toast.success("Payment settings saved");
      setShowInputs(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowInputs(false);
    setFieldValues(initializeFieldValues());
  };

  const toggleSecretVisibility = (fieldName: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const getGatewayStatus = () => {
    if (!localEnabled) return "disabled";
    if (isConfigured()) return "configured";
    if (isPartiallyConfigured()) return "partial";
    return "enabled";
  };

  const status = getGatewayStatus();

  // Get color scheme based on payment method
  const getColorScheme = () => {
    switch (method.name.toLowerCase()) {
      case 'razorpay':
        return {
          primary: 'blue',
          light: 'blue-50',
          medium: 'blue-100',
          dark: 'blue-600',
        };
      case 'payu':
        return {
          primary: 'green',
          light: 'green-50',
          medium: 'green-100',
          dark: 'green-600',
        };
      case 'phonepe':
        return {
          primary: 'purple',
          light: 'purple-50',
          medium: 'purple-100',
          dark: 'purple-600',
        };
      case 'cash':
      case 'cash in hand':
        return {
          primary: 'amber',
          light: 'amber-50',
          medium: 'amber-100',
          dark: 'amber-600',
        };
      default:
        return {
          primary: 'gray',
          light: 'gray-50',
          medium: 'gray-100',
          dark: 'gray-600',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <Card
      className={`overflow-hidden border-2 transition-all duration-300 ${status === "configured"
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
              className={`p-3 rounded-xl ${status === "configured"
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
              {/* <CardDescription className="mt-1 sm:mt-2 text-xs sm:text-sm">
                {status === "disabled" && "Click to enable this payment method"}
                {status === "enabled" && "Configure credentials to start accepting payments"}
                {status === "partial" && "Complete configuration to activate"}
                {status === "configured" && "Ready to accept payments"}
              </CardDescription> */}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3">
            <div className="flex items-center gap-3">
              {status === "configured" && !showInputs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInputs(true)}
                  className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm`}
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Edit
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={localEnabled ?? false}
                  onCheckedChange={handleSwitch}
                  disabled={!hydrated}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-xs text-gray-500 font-medium">
                  {localEnabled ? "ON" : "OFF"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </CardHeader>

      {/* Configuration Fields - Show when enabled or when editing */}
      {(showInputs || (localEnabled && !isConfigured())) && inputFields && (
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
                      {field.type === "textarea" ? (
                        <Textarea
                          id={key}
                          value={fieldValues[key] || ""}
                          onChange={(e) =>
                            handleFieldChange(key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          rows={field.rows || 3}
                          className="min-h-[80px] text-sm sm:text-base"
                        />
                      ) : isPassword ? (
                        <>
                          <Input
                            id={key}
                            type={isVisible ? "text" : "password"}
                            value={fieldValues[key] || ""}
                            onChange={(e) =>
                              handleFieldChange(key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="pr-10 text-sm sm:text-base"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(key)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {isVisible ? (
                              <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </button>
                        </>
                      ) : (
                        <Input
                          id={key}
                          type={field.type}
                          value={fieldValues[key] || ""}
                          onChange={(e) =>
                            handleFieldChange(key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          className="text-sm sm:text-base"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>


            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    Saving...
                  </>
                ) : status === "configured" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Update Configuration
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Save & Activate
                  </>
                )}
              </Button>

              {status === "configured" && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {/* Quick Info when configured and not editing */}
      {status === "configured" && !showInputs && inputFields && (
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