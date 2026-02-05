"use client";

import { useState, useEffect } from "react";
import ServiceInformation from "./doctor-forms/doctor-schedule";
import ServiceSEO from "./doctor-forms/doctor-seo";
import Sticky from "../sticky";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  addDoctorScheduleClient,
  updateDoctorScheduleClient,
} from "@/lib/api/doctor_schedule";
import { useRouter } from "next/navigation";
import { ServiceFormProps } from "@/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import WeeklyAppointment from "./doctor-forms/weekly-appointment";
import AppointmentTimingFormSimple from "./doctor-forms/appointment-timing-form";
import DoctorLocation from "./doctor-forms/doctor-location";
import DoctorLeave from "./doctor-forms/doctor-leave";
import { Calendar, Clock, MapPin, FileText, ShieldCheck } from "lucide-react";

const defaultLocation = {
  country: "",
  state: "",
  city: "",
  pincode: "",
  address: "",
  mapLink: "",
};

// Helper function to safely access formatted time
const getFormattedTimeDisplay = (formattedObj: any) => {
  if (!formattedObj || !formattedObj.time) return "Not set";
  return `${formattedObj.time} ${formattedObj.period || "AM"}`;
};

const Doctor_Schedule = ({
  serviceId,
  serviceData,
  isEdit,
}: ServiceFormProps) => {
  const router = useRouter();
  const { userData } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasWeeklyErrors, setHasWeeklyErrors] = useState(false);

  /* =========================
     FORM STATE (SINGLE SOURCE)
  ========================= */
  const [formData, setFormData] = useState(() => {
    const baseData = {
      slug: "",
      amount: "",
      categoryId: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      doctorLocation: defaultLocation,
      weeklySchedule: {},
      appointmentTimeFromFormatted: { time: "", period: "AM" as "AM" | "PM" },
      appointmentTimeToFormatted: { time: "", period: "AM" as "AM" | "PM" },
      leaveDates: [],
      specialization: "",
      qualification: "",
      experience: "",
      doctorImage: "",
      name: "",
      tokenLimit: "0",
    };

    if (isEdit && serviceData) {
      // Safely parse the formatted times from serviceData
      const fromFormatted = serviceData.appointmentTimeFromFormatted || { time: "", period: "AM" };
      const toFormatted = serviceData.appointmentTimeToFormatted || { time: "", period: "AM" };

      return {
        ...baseData,
        slug: serviceData.slug || "",
        amount: serviceData.amount?.toString() || "",
        categoryId: serviceData.categoryId?.toString() || "",
        description: serviceData.description || "",
        metaTitle: serviceData.metaTitle || "",
        metaDescription: serviceData.metaDescription || "",
        weeklySchedule: serviceData.weeklySchedule || {},
        appointmentTimeFromFormatted: {
          time: fromFormatted.time || "",
          period: fromFormatted.period || "AM"
        },
        appointmentTimeToFormatted: {
          time: toFormatted.time || "",
          period: toFormatted.period || "AM"
        },
        leaveDates: serviceData.leaveDates || [],
        specialization: serviceData.specialization || "",
        qualification: serviceData.qualification || "",
        experience: serviceData.experience?.toString() || "",
        doctorImage: serviceData.doctorImage || serviceData.doctor_image || "",
        name: serviceData.name || serviceData.doctor_name || "",
        tokenLimit: serviceData.token_limit?.toString() || "0",
        doctorLocation: serviceData.doctorLocation || defaultLocation,
      };
    }

    return baseData;
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* =========================
     SAVE / UPDATE
  ========================= */
  const handleSave = async () => {
    // 1️⃣ BASIC VALIDATION
    if (!formData.categoryId) {
      toast.error("Please select a doctor");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid consultation fee");
      return;
    }

    if (hasWeeklyErrors) {
      toast.error("Please fix weekly schedule errors");
      return;
    }

    setIsLoading(true);

    try {
      // 2️⃣ BUILD PAYLOAD
      const payload = {
        id: serviceId !== "add" ? serviceId : undefined,
        categoryId: formData.categoryId,
        name: formData.name,
        slug: formData.slug,
        amount: formData.amount,
        description: formData.description,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        doctorImage: formData.doctorImage,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        doctorLocation: formData.doctorLocation,
        weeklySchedule: formData.weeklySchedule,
        appointmentTimeFromFormatted: formData.appointmentTimeFromFormatted,
        appointmentTimeToFormatted: formData.appointmentTimeToFormatted,
        leaveDates: formData.leaveDates,
        doctor_name: formData.name,
        doctor_image: formData.doctorImage,
        tokenLimit: formData.tokenLimit,
      };

      console.log("Saving payload:", payload); // Debug log

      // 3️⃣ API CALL
      let response;
      if (isEdit && serviceId !== "add") {
        response = await updateDoctorScheduleClient(
          Number(serviceId),
          payload
        );
      } else {
        response = await addDoctorScheduleClient({
          ...payload,
          user_id: userData?.user_id,
        });
      }

      // 4️⃣ SUCCESS HANDLING
      if (response?.success) {
        toast.success(
          isEdit
            ? "Schedule updated successfully!"
            : "Schedule created successfully!"
        );

        router.push("/hos-opts");

        setTimeout(() => {
          router.refresh();
        }, 100);
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Safely check if appointment time is set
  const isAppointmentTimeSet = formData.appointmentTimeFromFormatted?.time || formData.appointmentTimeToFormatted?.time;

  return (
    <>
      {/* Header */}


      <div className="grid grid-cols-12 gap-6 pb-32">
        {/* Left Column */}
        <div className="lg:col-span-7 col-span-12">
          {/* Doctor Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Doctor Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Basic details about the doctor and consultation
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ServiceInformation
                slug={{
                  value: formData.slug,
                  setValue: (v) => updateField("slug", v),
                }}
                amount={{
                  value: formData.amount,
                  setValue: (v) => updateField("amount", v),
                }}
                tokenLimit={{
                  value: formData.tokenLimit,
                  setValue: (v) => updateField("tokenLimit", v),
                }}
                categoryId={{
                  value: formData.categoryId,
                  setValue: (v) => updateField("categoryId", v),
                }}
                description={{
                  value: formData.description,
                  setValue: (v) => updateField("description", v),
                }}
              />
            </div>
          </div>

          {/* Appointment Timing Card - SIMPLIFIED */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Appointment Timings
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set daily appointment availability
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <AppointmentTimingFormSimple
                value={{
                  fromFormatted: formData.appointmentTimeFromFormatted,
                  toFormatted: formData.appointmentTimeToFormatted
                }}
                onChange={(timing) => {
                  updateField("appointmentTimeFromFormatted", timing.appointmentTimeFromFormatted);
                  updateField("appointmentTimeToFormatted", timing.appointmentTimeToFormatted);
                }}
              />
            </div>
          </div>

          {/* Weekly Schedule Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Weekly Appointment Schedule
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set regular weekly availability and consultation slots
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <WeeklyAppointment
                value={formData.weeklySchedule}
                onChange={(v) => updateField("weeklySchedule", v)}
                onValidationChange={setHasWeeklyErrors}
                categoryId={formData.categoryId}
              />
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 col-span-12">
          {/* Location Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Practice Location
                  </h2>
                  <p className="text-sm text-gray-600">
                    Where the doctor is available for consultations
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <DoctorLocation
                value={formData.doctorLocation}
                setValue={(v) => updateField("doctorLocation", v)}
              />
            </div>
          </div>

          {/* SEO Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    SEO & Meta Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Optimize for search engines and social media
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ServiceSEO
                metaTitle={{
                  value: formData.metaTitle,
                  setValue: (v) => updateField("metaTitle", v),
                }}
                metaDescription={{
                  value: formData.metaDescription,
                  setValue: (v) => updateField("metaDescription", v),
                }}
              />
            </div>
          </div>

          {/* Leave Schedule Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border">
                    <Calendar className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Leave Schedule
                    </h2>
                    <p className="text-sm text-gray-600">
                      Mark days when doctor is unavailable
                    </p>
                  </div>
                </div>
                {formData.leaveDates.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-gray-700">
                      {formData.leaveDates.length}
                    </span>
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <DoctorLeave
                value={formData.leaveDates}
                onChange={(v) => updateField("leaveDates", v)}
              />
            </div>
          </div>
        </div>
        <Sticky>
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.categoryId || hasWeeklyErrors}
            isLoading={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md min-w-[120px]"
          >
            {isEdit ? "Update Schedule" : "Create Schedule"}
          </Button>
        </Sticky>
      </div>
    </>
  );
};

export default Doctor_Schedule;