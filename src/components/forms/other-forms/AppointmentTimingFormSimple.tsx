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
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [fromPeriod, setFromPeriod] = useState<"AM" | "PM">("AM");
  const [toPeriod, setToPeriod] = useState<"AM" | "PM">("AM");

  // Parse initial values from props
  useEffect(() => {
    console.log("AppointmentTimingFormSimple - Initial value received:", value);
    
    if (value?.fromFormatted?.time) {
      console.log("Setting from time:", value.fromFormatted.time, value.fromFormatted.period);
      setFromTime(value.fromFormatted.time);
      setFromPeriod(value.fromFormatted.period || "AM");
    }
    
    if (value?.toFormatted?.time) {
      console.log("Setting to time:", value.toFormatted.time, value.toFormatted.period);
      setToTime(value.toFormatted.time);
      setToPeriod(value.toFormatted.period || "AM");
    }
  }, [value]);

  // Handle time change
  const handleTimeChange = (
    type: "from" | "to",
    timeValue: string,
    periodValue: "AM" | "PM"
  ) => {
    console.log(`Time change - ${type}: ${timeValue} ${periodValue}`);
    
    if (type === "from") {
      setFromTime(timeValue);
      setFromPeriod(periodValue);
    } else {
      setToTime(timeValue);
      setToPeriod(periodValue);
    }
    
    // Send updated values to parent
    const newTiming = {
      appointmentTimeFromFormatted: {
        time: type === "from" ? timeValue : fromTime,
        period: type === "from" ? periodValue : fromPeriod
      },
      appointmentTimeToFormatted: {
        time: type === "to" ? timeValue : toTime,
        period: type === "to" ? periodValue : toPeriod
      }
    };
    
    console.log("Calling onChange with:", newTiming);
    onChange(newTiming);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Appointment Timings</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Start Time
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => handleTimeChange("from", e.target.value, fromPeriod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-24">
                <select
                  value={fromPeriod}
                  onChange={(e) => handleTimeChange("from", fromTime, e.target.value as "AM" | "PM")}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment End Time
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => handleTimeChange("to", e.target.value, toPeriod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="w-24">
                <select
                  value={toPeriod}
                  onChange={(e) => handleTimeChange("to", toTime, e.target.value as "AM" | "PM")}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}