"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string[];
  onChange: (dates: string[]) => void;
};

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const DoctorLeave = ({ value, onChange }: Props) => {
  const selectedDates = value.map(d => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const today = getToday();

  const removeDate = (dateToRemove: string) => {
    onChange(value.filter(date => date !== dateToRemove));
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "MMM dd, yyyy");
  };

  // Check if a date is before today
  const isPastDate = (date: Date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  // Check if a string date is in the past
  const isDateStringPast = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          </div>

        </div>
      </div>

      {/* Selected Dates Summary */}
      {value.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected Leave Dates ({value.length})
            </span>
            <button
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map(date => (
              <div
                key={date}
                className={`flex items-center gap-1 border rounded-lg px-3 py-2 shadow-xs ${
                  isDateStringPast(date)
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    isDateStringPast(date) ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {formatDate(date)}
                </span>
                <button
                  onClick={() => removeDate(date)}
                  className="ml-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove ${formatDate(date)}`}
                  disabled={isDateStringPast(date)}
                  title={
                    isDateStringPast(date)
                      ? "Cannot remove past dates"
                      : "Remove date"
                  }
                >
                  <X
                    className={`h-3.5 w-3.5 ${
                      isDateStringPast(date)
                        ? "text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Section */}
      {isCalendarOpen && (
        <div className="p-6">


          <div className="flex justify-center">
            <DayPicker
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => {
                const formatted = dates?.map(d => toLocalDateString(d)) || [];
                onChange(formatted);
              }}
              disabled={isPastDate}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-xs"
              classNames={{
                months: "flex justify-center",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-semibold text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-between",
                head_cell: "text-gray-600 rounded-md w-9 font-normal text-sm",
                row: "flex justify-between mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:bg-blue-600 aria-selected:text-white hover:bg-gray-100 rounded-md transition-colors",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                day_today: "bg-gray-100 text-gray-900 font-medium",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-300 bg-gray-50 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                day_hidden: "invisible",
              }}
              modifiersStyles={{
                selected: {
                  backgroundColor: "#2563eb",
                  color: "white",
                  fontWeight: 600,
                },
                disabled: {
                  backgroundColor: "#f9fafb",
                  color: "#d1d5db",
                  cursor: "not-allowed",
                }
              }}
              footer={
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-blue-600 rounded-sm"></div>
                      <span>Selected Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-100 rounded-sm border"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-gray-50 rounded-sm border border-gray-300"></div>
                      <span>Disabled (Past)</span>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      )}

      {/* Footer Stats */}

    </div>
  );
};

export default DoctorLeave;