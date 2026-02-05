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
import { InputField, FormValueProps } from "@/types";

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

const Step3 = ({
  siteName,
  country,
  email,
  password,
  serviceTypeId,
}: FormValueProps & {
  serviceTypeId: { value: number | null; setValue: (v: number) => void };
}) => {
  const inputFields: Form = {

        serviceTypeId: {
      type: "select",
      value: serviceTypeId?.value ? String(serviceTypeId.value) : "",
      label: "Service Type",
      placeholder: "Select service type",
      options: SERVICE_TYPES,
      // ⛔ DO NOT convert here
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
      type: "password",
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
                    serviceTypeId.setValue(Number(value)); // ✅ convert here
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
