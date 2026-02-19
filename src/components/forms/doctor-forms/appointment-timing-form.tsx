"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

type Props = {
  value: {
    fromFormatted?: {
      time: string;
      period: "AM" | "PM";
    };
    toFormatted?: {
      time: string;
      period: "AM" | "PM";
    };
  };
  onChange: (timing: {
    appointmentTimeFromFormatted: { time: string; period: "AM" | "PM" };
    appointmentTimeToFormatted: { time: string; period: "AM" | "PM" };
  }) => void;
};

export default function AppointmentTimingFormSimple({ value, onChange }: Props) {
  // State for 24-hour format (for input fields)
  const [fromTime24, setFromTime24] = useState("");
  const [toTime24, setToTime24] = useState("");

  // Convert 12h to 24h format
  const convertTo24Hour = (time12: string, period: "AM" | "PM"): string => {
    if (!time12) return "";
    const [hours, minutes] = time12.split(":");
    let hour = parseInt(hours, 10);
    
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24h to 12h format
  const convertTo12Hour = (time24: string): { time: string; period: "AM" | "PM" } => {
    if (!time24) return { time: "", period: "AM" };
    
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    
    return {
      time: `${hour12.toString().padStart(2, "0")}:${minutes}`,
      period
    };
  };

  // Initialize from props
  useEffect(() => {
    if (value?.fromFormatted?.time) {
      setFromTime24(convertTo24Hour(value.fromFormatted.time, value.fromFormatted.period));
    }
    if (value?.toFormatted?.time) {
      setToTime24(convertTo24Hour(value.toFormatted.time, value.toFormatted.period));
    }
  }, [value]);

  // Handle time changes
  const handleFromTimeChange = (time24: string) => {
    setFromTime24(time24);
    const from12 = convertTo12Hour(time24);
    const to12 = convertTo12Hour(toTime24);
    
    onChange({
      appointmentTimeFromFormatted: from12,
      appointmentTimeToFormatted: to12
    });
  };

  const handleToTimeChange = (time24: string) => {
    setToTime24(time24);
    const from12 = convertTo12Hour(fromTime24);
    const to12 = convertTo12Hour(time24);
    
    onChange({
      appointmentTimeFromFormatted: from12,
      appointmentTimeToFormatted: to12
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Appointment Timings
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Set daily appointment availability
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Start Time */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Appointment Start Time
              <span className="text-xs text-gray-400 ml-2">(24h format)</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={fromTime24}
                onChange={(e) => handleFromTimeChange(e.target.value)}
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white hover:border-gray-400 transition-colors"
                placeholder="--:--"
              />
              {fromTime24 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 
                              text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {convertTo12Hour(fromTime24).time} {convertTo12Hour(fromTime24).period}
                </div>
              )}
            </div>
           
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Appointment End Time
              <span className="text-xs text-gray-400 ml-2">(24h format)</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={toTime24}
                onChange={(e) => handleToTimeChange(e.target.value)}
                className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white hover:border-gray-400 transition-colors"
                placeholder="--:--"
              />
              {toTime24 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 
                              text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 rounded">
                  {convertTo12Hour(toTime24).time} {convertTo12Hour(toTime24).period}
                </div>
              )}
            </div>
           
          </div>


        </div>
      </div>
    </div>
  );
}