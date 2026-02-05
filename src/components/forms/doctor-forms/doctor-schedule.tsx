"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { InputField, Option } from "@/types";
import FormInputs from "@/components/form-inputs";
import useCurrentUser from "@/hooks/useCurrentUser";
import { fetchDoctorsClient } from "@/lib/api/doctor_schedule";

interface Form {
  [key: string]: InputField;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="mb-2 sm:mb-3">
      <strong className="text-sm sm:text-base">{label}:</strong>{" "}
      <span className="text-sm sm:text-base">{value}</span>
    </div>
  );
};

type Props = {
  slug: {
    value: string;
    setValue: (v: string) => void;
  };
  amount: {
    value: string;
    setValue: (v: string) => void;
  };
  tokenLimit: {
    value: string;
    setValue: (v: string) => void;
  };
  categoryId: {
    value: string;
    setValue: (v: string) => void;
  };
  description: {
    value: string;
    setValue: (v: string) => void;
  };
};

const ServiceInformation = ({
  slug,
  amount,
  tokenLimit,
  categoryId,
  description,
}: Props) => {
  const { userData } = useCurrentUser();

  const [doctorOptions, setDoctorOptions] = useState<Option[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  /* =========================
     LOAD DOCTORS
  ========================= */
  useEffect(() => {
    if (!userData?.user_id) return;

    const loadDoctors = async () => {
      try {
        const list = await fetchDoctorsClient(Number(userData?.user_id ?? 0));
        if (!Array.isArray(list)) return;

        const mapped = list.map((doc: any) => ({
          label: doc.doctor_name,
          value: doc.category_id,   // keep as string
          full: doc,
        }));

        setDoctorOptions(mapped);

        if (categoryId.value) {
          const existing = mapped.find(
            (d) => d.value === Number(categoryId.value)
          );

          if (existing) {
            setSelectedDoctor(existing.full);

            if (!slug.value) {
              const autoSlug =
                `${existing.full.doctor_name}-${existing.full.specialization || ""}`
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");

              slug.setValue(autoSlug);
            }
          }
        }
      } catch (err) {
        console.error("Doctor Load Error:", err);
      }
    };

    loadDoctors();
  }, [userData, categoryId.value, slug.value]);

  /* =========================
     HANDLERS
  ========================= */
  const handleDoctorSelect = (doctorVal: string | number) => {
    const found = doctorOptions.find(
      (o) => String(o.value) === String(doctorVal)
    );
    if (!found) return;

    // ALWAYS set numeric ID
    categoryId.setValue(String(found.full.category_id));

    const autoSlug =
      `${found.full.doctor_name}-${found.full.specialization || ""}`
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    slug.setValue(autoSlug);
    setSelectedDoctor(found.full);
  };

  const handleAmountChange = (value: string) => {
    amount.setValue(value.replace(/[^\d.]/g, ""));
  };

  const handleTokenLimitChange = (value: string) => {
    tokenLimit.setValue(value.replace(/[^\d]/g, ""));
  };

  /* =========================
     FORM FIELDS
  ========================= */
  const inputFields: Form = {
    doctor: {
      type: "select",
      value: categoryId.value || "",
      setValue: handleDoctorSelect,
      label: "Select Doctor *",
      placeholder: "Choose a doctor",
      options: doctorOptions,
      required: true,
    },

    amount: {
      type: "number",
      value: amount.value,
      setValue: handleAmountChange,
      label: "Consultation Fee (₹) *",
      placeholder: "e.g., 500",
      required: true,
      min: "1",
      step: "1",
    },

    tokenLimit: {
      type: "number",
      value: tokenLimit.value,
      setValue: handleTokenLimitChange,
      label: "Token Limit",
      placeholder: "0 = Unlimited",
      min: "0",
      step: "1",
    },

    slug: {
      type: "text",
      value: slug.value,
      setValue: slug.setValue,
      label: "Slug (auto-generated)",
      readOnly: true,
    },

    description: {
      type: "textarea",
      value: description.value,
      setValue: description.setValue,
      label: "Description",
      placeholder: "Describe the consultation service...",
      rows: 4,
    },
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm border">
      <FormInputs inputFields={inputFields} />

      {selectedDoctor && (
        <div className="mt-4 sm:mt-5 md:mt-6 rounded-xl border bg-white shadow-sm">
          <div className="border-b px-4 sm:px-5 md:px-6 py-3 sm:py-4">
            <h4 className="text-base sm:text-lg md:text-lg font-semibold text-gray-800">
              🩺 Doctor Profile
            </h4>
          </div>

          <div className="p-4 sm:p-5 md:p-6 flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-8">
            {selectedDoctor.doctor_image && (
              <div className="flex-shrink-0 flex justify-center md:justify-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg overflow-hidden border shadow-sm bg-gray-100">
                  <Image
                    src={
                      selectedDoctor.doctor_image.startsWith("http")
                        ? selectedDoctor.doctor_image
                        : `http://localhost/manager.bookpanlam/public/uploads/${selectedDoctor.doctor_image}`
                    }
                    alt={selectedDoctor.doctor_name}
                    width={130}
                    height={130}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 md:gap-x-10 gap-y-2 sm:gap-y-3 text-sm sm:text-[15px] text-gray-700 flex-1">
              <InfoRow label="Name" value={selectedDoctor.doctor_name} />
              <InfoRow
                label="Specialization"
                value={selectedDoctor.specialization}
              />
              <InfoRow
                label="Qualification"
                value={selectedDoctor.qualification}
              />
              <InfoRow
                label="Experience"
                value={
                  selectedDoctor.experience
                    ? `${selectedDoctor.experience} years`
                    : null
                }
              />

              {amount.value && (
                <div className="sm:col-span-2">
                  <strong className="text-blue-600 text-sm sm:text-base">Consultation Fee:</strong>
                  <div className="flex items-center mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">
                      ₹ {amount.value}
                    </span>
                  </div>
                </div>
              )}

              {tokenLimit.value !== undefined && (
                <div className="sm:col-span-2">
                  <strong className="text-green-600 text-sm sm:text-base">Token Limit:</strong>
                  <span className="ml-2 font-semibold text-sm sm:text-base">
                    {tokenLimit.value === "0"
                      ? "Unlimited"
                      : tokenLimit.value}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceInformation;