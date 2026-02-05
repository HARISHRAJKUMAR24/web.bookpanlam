"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Sticky from "../sticky";
import { CalendarDays, Clock } from "lucide-react";

import OtherImages from "./other-forms/other-images";
import OtherDetails from "./other-forms/other-details";
import OtherSchedule from "./other-forms/other-schedule";
import OthLeave from "./other-forms/oth-leave";
import AppointmentTimingFormSimple from "./other-forms/AppointmentTimingFormSimple"; // Import the component

import { updateAppointmentSettings } from "@/lib/api/departments";

type Props = {
  department: any;
};

// Helper function to convert 24-hour to 12-hour format
const convertTo12HourFormat = (time24: string | null) => {
  if (!time24) return { time: "", period: "AM" as "AM" | "PM" };
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  
  let period: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  
  return {
    time: `${hour12.toString().padStart(2, '0')}:${minutes}`,
    period
  };
};

// Helper function to convert 12-hour to 24-hour format
const convertTo24HourFormat = (time: string, period: "AM" | "PM"): string => {
  if (!time) return "";
  
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

const OtherForm = ({ department }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [hasScheduleErrors, setHasScheduleErrors] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  
  // Add formData state
  const [formData, setFormData] = useState({
    leaveDates: [] as string[],
    appointmentTimeFrom: null as string | null,
    appointmentTimeTo: null as string | null
  });

  // Appointment timing state for the simple form
  const [appointmentTiming, setAppointmentTiming] = useState<{
    fromFormatted?: {
      time: string;
      period: "AM" | "PM";
    };
    toFormatted?: {
      time: string;
      period: "AM" | "PM";
    };
  }>({});

  // Initialize formData from department
  useEffect(() => {
    if (department) {
      // Ensure leaveDates is always an array
      const leaveDates = department.leave_dates || department.leaveDates || [];

      // Get appointment timing from department
      const appointmentTimeFrom = department.appointmentTimeFrom || department.appointment_time_from || null;
      const appointmentTimeTo = department.appointmentTimeTo || department.appointment_time_to || null;

      console.log("Department appointment timing:", {
        from: appointmentTimeFrom,
        to: appointmentTimeTo
      });

      setFormData(prev => ({
        ...prev,
        leaveDates: Array.isArray(leaveDates) ? leaveDates : JSON.parse(leaveDates || "[]"),
        appointmentTimeFrom,
        appointmentTimeTo
      }));

      // Set appointment timing for the simple form
      setAppointmentTiming({
        fromFormatted: appointmentTimeFrom ? convertTo12HourFormat(appointmentTimeFrom) : undefined,
        toFormatted: appointmentTimeTo ? convertTo12HourFormat(appointmentTimeTo) : undefined
      });

      // Initialize schedule from department
      if (department.appointment_settings || department.appointmentSettings) {
        const scheduleData = department.appointment_settings || department.appointmentSettings;
        setSchedule(scheduleData);
      } else {
        // Set default empty schedule
        const defaultSchedule = {
          "Sun": { enabled: false, slots: [] },
          "Mon": { enabled: false, slots: [] },
          "Tue": { enabled: false, slots: [] },
          "Wed": { enabled: false, slots: [] },
          "Thu": { enabled: false, slots: [] },
          "Fri": { enabled: false, slots: [] },
          "Sat": { enabled: false, slots: [] }
        };
        setSchedule(defaultSchedule);
      }
    }
  }, [department]);

  // Update field helper
  const updateField = (field: string, value: any) => {
    console.log(`Updating field ${field}:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle schedule updates
  const handleScheduleUpdate = (updatedData: any) => {
    console.log("Schedule update received:", updatedData);

    // Case 1: If it's just the weekly schedule object
    if (updatedData.Sun || updatedData.Mon || updatedData.Tue) {
      setSchedule(updatedData);
    }
    // Case 2: If it's the appointment timing data (shouldn't happen now since we moved it)
    else if (
      updatedData.appointment_time_from !== undefined ||
      updatedData.appointment_time_to !== undefined ||
      updatedData.appointmentTimeFrom !== undefined ||
      updatedData.appointmentTimeTo !== undefined
    ) {

      const from = updatedData.appointment_time_from
        ?? updatedData.appointmentTimeFrom
        ?? null;

      const to = updatedData.appointment_time_to
        ?? updatedData.appointmentTimeTo
        ?? null;

      setFormData(prev => ({
        ...prev,
        appointmentTimeFrom: from,
        appointmentTimeTo: to
      }));
    }

    // Case 3: If it's the complete data structure
    else if (updatedData.appointment_settings) {
      setSchedule(updatedData.appointment_settings);
      if (updatedData.appointment_time_from !== undefined || updatedData.appointment_time_to !== undefined) {
        setFormData(prev => ({
          ...prev,
          appointmentTimeFrom: updatedData.appointment_time_from || null,
          appointmentTimeTo: updatedData.appointment_time_to || null
        }));
      }
    }
  };

  // Handle appointment timing change from AppointmentTimingFormSimple
  const handleAppointmentTimingChange = (timing: {
    appointmentTimeFromFormatted: { time: string; period: "AM" | "PM" };
    appointmentTimeToFormatted: { time: string; period: "AM" | "PM" };
  }) => {
    console.log("Appointment timing change:", timing);
    
    // Update local state for the form
    setAppointmentTiming({
      fromFormatted: timing.appointmentTimeFromFormatted,
      toFormatted: timing.appointmentTimeToFormatted
    });
    
    // Convert to 24-hour format for formData
    const fromTime24 = timing.appointmentTimeFromFormatted.time 
      ? convertTo24HourFormat(timing.appointmentTimeFromFormatted.time, timing.appointmentTimeFromFormatted.period) 
      : null;
    
    const toTime24 = timing.appointmentTimeToFormatted.time 
      ? convertTo24HourFormat(timing.appointmentTimeToFormatted.time, timing.appointmentTimeToFormatted.period) 
      : null;

    console.log("Converted times (24h):", { fromTime24, toTime24 });
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      appointmentTimeFrom: fromTime24,
      appointmentTimeTo: toTime24
    }));
  };

  const handleSave = async () => {
    if (!schedule) {
      toast.error("Please configure appointment schedule first");
      return;
    }

    if (hasScheduleErrors) {
      toast.error("Please fix schedule errors before saving");
      return;
    }

    const departmentId = department?.departmentId || department?.department_id;

    if (!departmentId) {
      toast.error("Invalid department");
      return;
    }

    try {
      setIsLoading(true);

      console.log("Saving data to API:", {
        departmentId,
        schedule,
        leaveDates: formData.leaveDates,
        appointmentTimeFrom: formData.appointmentTimeFrom,
        appointmentTimeTo: formData.appointmentTimeTo
      });

      // Save schedule, leave dates, AND appointment timing
      const res = await updateAppointmentSettings(
        departmentId,
        schedule,
        formData.leaveDates,
        formData.appointmentTimeFrom,
        formData.appointmentTimeTo
      );

      console.log("API Response:", res);

      if (!res?.success) {
        // Show specific error message from backend
        throw new Error(res?.message || "Failed to save schedule");
      }

      toast.success("Schedule timing saved successfully!");

      // Update local state with response data
      if (res.appointment_time_from || res.appointment_time_to) {
        setFormData(prev => ({
          ...prev,
          appointmentTimeFrom: res.appointment_time_from || null,
          appointmentTimeTo: res.appointment_time_to || null
        }));
      }

    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="space-y-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OtherImages department={department} />
          <OtherDetails department={department} />
        </div>

        {/* Leave Schedule & Appointment Timing Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border">
                  <CalendarDays className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Leave Schedule & Appointment Timing
                  </h2>
                  <p className="text-sm text-gray-600">
                    Set leave dates and daily appointment hours
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Show selected days count */}
                {/* {formData.leaveDates.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-gray-700">
                      {formData.leaveDates.length}
                    </span>
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                )} */}
                {/* Calendar toggle button */}
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="text-sm text-amber-600 hover:text-amber-800 font-medium px-3 py-1 rounded-md hover:bg-amber-50 transition-colors border border-amber-200"
                >
                  {isCalendarOpen ? "Hide Calendar" : "Show Calendar"}
                </button>
              </div>
            </div>
          </div>

          {/* Left-Right Layout Container */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Appointment Timing */}
              <div>
                <div className="sticky top-6">
                  <AppointmentTimingFormSimple
                    value={appointmentTiming}
                    onChange={handleAppointmentTimingChange}
                  />
                </div>
              </div>

              {/* Right Column - Leave Calendar */}
              <div>
                <OthLeave
                  value={formData.leaveDates}
                  onChange={(v) => updateField("leaveDates", v)}
                  departmentId={department?.departmentId}
                  title="Department"
                  isCalendarOpen={isCalendarOpen}
                  onCalendarToggle={() => setIsCalendarOpen(!isCalendarOpen)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule - Remove AppointmentTimingFormSimple from here */}
        <OtherSchedule
          department={department}
          onSave={handleScheduleUpdate}
          onValidationChange={setHasScheduleErrors}
          hideAppointmentTiming={true} // Add this prop to hide appointment timing
        />
      </div>

      {/* SAVE BAR - ALWAYS SHOW */}
      <Sticky>
        <Button
          onClick={handleSave}
          disabled={isLoading || hasScheduleErrors}
          isLoading={isLoading}
          className={
            hasScheduleErrors
              ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }
        >
          {hasScheduleErrors ? "Fix Errors First" : "Save All Settings"}
        </Button>
      </Sticky>
    </>
  );
};

export default OtherForm;