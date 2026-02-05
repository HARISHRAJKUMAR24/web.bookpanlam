"use client";

import { useState, useEffect } from "react";
import { Trash2, Calendar, Settings, Clock, Plus, Minus, Info, ChevronDown, ChevronUp } from "lucide-react";
import TokenUpdateModal from "./token-update-modal";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SlotType = {
  batch_id: string;
  from: string;
  to: string;
  breakFrom: string;
  breakTo: string;
  token: string;
  fromPeriod: "AM" | "PM";
  toPeriod: "AM" | "PM";
  breakFromPeriod: "AM" | "PM";
  breakToPeriod: "AM" | "PM";
  enabled: boolean;
};

type DayScheduleType = {
  enabled: boolean;
  slots: SlotType[];
};

type ScheduleType = {
  [key: string]: DayScheduleType;
};

type Props = {
  value: any;
  onChange: (val: any) => void;
  onValidationChange?: (hasErrors: boolean) => void;
  categoryId?: string;
};

// Generate batch_id based on day index and slot index
const generateBatchId = (day: string, slotIndex: number): string => {
  const dayIndex = days.indexOf(day);
  return `${dayIndex}:${slotIndex}`;
};

// Convert 12-hour time to 24-hour format
const convertTo24Hour = (time: string, period: "AM" | "PM"): string => {
  if (!time) return "";

  const [hoursStr, minutes] = time.split(":");
  let hours = parseInt(hoursStr);

  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Convert 24-hour time to 12-hour with period
const convertTo12Hour = (time24: string): { time: string, period: "AM" | "PM" } => {
  if (!time24 || time24.trim() === "") {
    return { time: "", period: "AM" };
  }

  const cleanTime = time24.trim();

  if (cleanTime.toUpperCase().includes("AM") || cleanTime.toUpperCase().includes("PM")) {
    const timePart = cleanTime.replace(/ AM| PM|am|pm/i, "").trim();
    const period = cleanTime.toUpperCase().includes("PM") ? "PM" : "AM" as "AM" | "PM";
    return { time: timePart, period };
  }

  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(cleanTime)) {
    return { time: "", period: "AM" };
  }

  const [hoursStr, minutes] = cleanTime.split(":");
  let hours = parseInt(hoursStr);
  let period: "AM" | "PM" = "AM";

  if (hours >= 12) {
    period = "PM";
    if (hours > 12) hours -= 12;
  }
  if (hours === 0) hours = 12;

  return {
    time: `${hours.toString().padStart(2, '0')}:${minutes}`,
    period
  };
};

const formatScheduleForDB = (schedule: ScheduleType): any => {
  const formattedSchedule: any = {};

  Object.keys(schedule).forEach(day => {
    const dayData = schedule[day];

    formattedSchedule[day] = {
      enabled: dayData.enabled,
      slots: dayData.slots.map((slot, index) => ({
        batch_id: generateBatchId(day, index),
        enabled: slot.enabled,  // IMPORTANT: Make sure this line exists and is correct
        from: slot.from && slot.fromPeriod
          ? convertTo24Hour(slot.from, slot.fromPeriod)
          : "",
        to: slot.to && slot.toPeriod
          ? convertTo24Hour(slot.to, slot.toPeriod)
          : "",
        breakFrom: slot.breakFrom && slot.breakFromPeriod
          ? convertTo24Hour(slot.breakFrom, slot.breakFromPeriod)
          : "",
        breakTo: slot.breakTo && slot.breakToPeriod
          ? convertTo24Hour(slot.breakTo, slot.breakToPeriod)
          : "",
        token: slot.token || "0"
      }))
    };
  });

  return formattedSchedule;
};


export default function WeeklyAppointment({


  value,
  onChange,
  onValidationChange,
  categoryId,
}: Props) {
  // Initialize schedule with default values
  const initializeSchedule = (): ScheduleType => {
    const initialSchedule: ScheduleType = {};
    days.forEach(day => {
      initialSchedule[day] = {
        enabled: false,
        slots: []
      };
    });
    return initialSchedule;
  };

  const parseValue = (val: any): ScheduleType => {
    if (!val) return initializeSchedule();

    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      const schedule: ScheduleType = initializeSchedule();

      Object.keys(parsed).forEach((day) => {
        if (days.includes(day) && parsed[day]) {
          schedule[day] = {
            enabled: !!parsed[day].enabled,
            slots: (parsed[day].slots || []).map((slot: any, index: number) => {
              const from = convertTo12Hour(slot.from || "");
              const to = convertTo12Hour(slot.to || "");
              const breakFrom = convertTo12Hour(slot.breakFrom || "");
              const breakTo = convertTo12Hour(slot.breakTo || "");

              return {
                batch_id: slot.batch_id || generateBatchId(day, index),
                from: from.time,
                to: to.time,
                breakFrom: breakFrom.time,
                breakTo: breakTo.time,
                token: slot.token || "",
                fromPeriod: from.period,
                toPeriod: to.period,
                breakFromPeriod: breakFrom.period,
                breakToPeriod: breakTo.period,
                enabled: slot.enabled !== undefined ? slot.enabled : true  // CRITICAL: Ensure enabled is preserved
              };
            })
          };
        }
      });

      return schedule;
    } catch (error) {
      console.error("Error parsing schedule:", error);
      return initializeSchedule();
    }
  };

  const [schedule, setSchedule] = useState<ScheduleType>(() => parseValue(value));
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);


  useEffect(() => {
    setSchedule(parseValue(value));
  }, [value]);


  const validateSchedule = (data: ScheduleType) => {
    let hasErrors = false;

    Object.keys(data).forEach((day) => {
      if (!data[day]?.enabled) return;

      if (!data[day].slots || data[day].slots.length === 0) {
        hasErrors = true;
        return;
      }

      data[day].slots.forEach((slot: SlotType) => {
        // Check if slot is enabled before validating
        if (!slot.enabled) return;  // ⭐⭐⭐ Skip validation for disabled slots

        if (!slot.from || !slot.to) {
          hasErrors = true;
          return;
        }

        // Only validate token if slot is enabled
        if (slot.enabled) {
          const tokenNum = parseInt(slot.token || "0");
          if (isNaN(tokenNum) || tokenNum < 0) {
            hasErrors = true;
            return;
          }
        }
      });
    });

    return hasErrors;
  };

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validateSchedule(schedule));
    }
  }, [schedule]);

  // Toggle day enabled/disabled
  const toggleDay = (day: string) => {
    const enabled = !schedule[day]?.enabled;

    const updated = {
      ...schedule,
      [day]: {
        ...schedule[day],   // keep slots unchanged!
        enabled
      }
    };

    setSchedule(updated);
    onChange(formatScheduleForDB(updated));

    if (enabled) {
      setExpandedDay(day);
    }
  };


  // Toggle day expansion
  const toggleDayExpansion = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  // Update slot (REMOVED token update from here)
  const updateSlot = (
    day: string,
    index: number,
    key: keyof SlotType,
    val: string | boolean
  ) => {
    // Don't allow token updates directly from the slot
    if (key === "token") {
      return; // Token updates only through modal
    }

    const updated = { ...schedule };

    if (key === "enabled") {
      // Update the slot's enabled state
      updated[day].slots[index][key] = val as boolean;
    } else {
      updated[day].slots[index][key] = val as any;
    }

    // Force a new reference to trigger state update
    setSchedule({ ...updated });

    // Format and send to parent
    const formatted = formatScheduleForDB(updated);
    onChange(formatted);
  };

  // Add new slot
  const addSlot = (day: string) => {
    const updated = { ...schedule };
    const newSlotIndex = updated[day].slots.length;
    const lastSlot = updated[day].slots[newSlotIndex - 1];

    // Set default times based on last slot
    let defaultFrom = "09:00";
    let defaultTo = "17:00";
    let defaultToken = "10";

    if (lastSlot) {
      const [lastHours, lastMinutes] = lastSlot.to.split(":");
      const lastTotalMinutes = parseInt(lastHours) * 60 + parseInt(lastMinutes);
      const newTotalMinutes = lastTotalMinutes + 30; // Add 30 minutes
      const newHours = Math.floor(newTotalMinutes / 60);
      const newMinutes = newTotalMinutes % 60;

      defaultFrom = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      defaultTo = `${(newHours + 1).toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      defaultToken = lastSlot.token;
    }

    updated[day].slots.push({
      batch_id: generateBatchId(day, newSlotIndex),
      enabled: true,
      from: defaultFrom,
      to: defaultTo,
      breakFrom: "",
      breakTo: "",
      token: defaultToken,
      fromPeriod: parseInt(defaultFrom.split(":")[0]) < 12 ? "AM" : "PM",
      toPeriod: parseInt(defaultTo.split(":")[0]) < 12 ? "AM" : "PM",
      breakFromPeriod: "AM",
      breakToPeriod: "AM"
    });

    setSchedule(updated);
    onChange(formatScheduleForDB(updated));
  };

  // Remove slot
  const removeSlot = (day: string, index: number) => {
    const updated = { ...schedule };
    updated[day].slots.splice(index, 1);

    // Reassign batch_ids for remaining slots
    updated[day].slots.forEach((slot, idx) => {
      slot.batch_id = generateBatchId(day, idx);
    });

    setSchedule(updated);
    onChange(formatScheduleForDB(updated));
  };

  // Handle token update click
  const handleTokenUpdateClick = (day: string, slot: SlotType, slotIndex: number) => {
    setSelectedSlot({
      batch_id: slot.batch_id,
      currentToken: slot.token,
      day: day,
      slotIndex: slotIndex + 1,
      startTime: slot.from && slot.fromPeriod ? `${slot.from} ${slot.fromPeriod}` : "",
      endTime: slot.to && slot.toPeriod ? `${slot.to} ${slot.toPeriod}` : "",
      categoryId: categoryId || ""
    });
    setTokenModalOpen(true);
  };

  // Handle token update from modal
  const handleTokenUpdated = async (newToken: string, batchId: string) => {
    const updated = { ...schedule };
    Object.keys(updated).forEach(day => {
      if (updated[day].enabled) {
        updated[day].slots.forEach(slot => {
          if (slot.batch_id === batchId) {
            slot.token = newToken;
          }
        });
      }
    });

    setSchedule(updated);
    onChange(formatScheduleForDB(updated));
    setTokenModalOpen(false);
  };

  const hasEnabledDays = Object.keys(schedule).some(
    (day) => schedule[day]?.enabled
  );

  const enabledDaysCount = Object.keys(schedule).filter(
    (day) => schedule[day]?.enabled
  ).length;

  const totalSlotsCount = Object.keys(schedule).reduce(
    (total, day) => total + (schedule[day]?.slots?.length || 0),
    0
  );

  return (
    <>
      {/* Main Container - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">


        {/* Days Selection - Clean Grid */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1 sm:mb-2">Select Days</h3>
            <p className="text-xs text-gray-500">Click to enable/disable appointments</p>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="flex flex-col items-center">
                <button
                  className={`w-full py-2 sm:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${schedule[day]?.enabled
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  onClick={() => toggleDay(day)}
                >
                  <div className="font-medium">{day}</div>
                </button>
                {schedule[day]?.enabled && schedule[day].slots.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs text-green-600 font-medium">
                      {schedule[day].slots.length}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area - Better Spacing */}
        <div className="p-4 sm:p-5 md:p-6">
          {/* Empty State */}
          {!hasEnabledDays && (
            <div className="text-center py-8 sm:py-10 md:py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base font-medium text-gray-700 mb-1 sm:mb-2">No Days Selected</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select days from above to configure time slots
              </p>
            </div>
          )}

          {/* Enabled Days Section */}
          {hasEnabledDays && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">
                  Time Slots ({enabledDaysCount} {enabledDaysCount === 1 ? 'Day' : 'Days'})
                </h3>
                <div className="text-xs sm:text-sm text-gray-500">
                  {totalSlotsCount} total slots
                </div>
              </div>

              {/* Days List - More Compact */}
              <div className="space-y-3">
                {Object.keys(schedule).map(
                  (day) =>
                    schedule[day]?.enabled && (
                      <div
                        key={day}
                        className={`border border-gray-200 rounded-lg overflow-hidden ${expandedDay === day ? 'ring-1 ring-blue-300' : ''
                          }`}
                      >
                        {/* Day Header - More Compact */}
                        <div
                          className="px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleDayExpansion(day)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${schedule[day]?.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">{day}</h4>
                              <span className="text-xs sm:text-sm text-gray-500">
                                ({schedule[day].slots.length} slot{schedule[day].slots.length !== 1 ? 's' : ''})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSlot(day);
                                }}
                                className="px-2 sm:px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span className="hidden xs:inline">Add Slot</span>
                              </button>
                              {expandedDay === day ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Slots Content - Better Organized */}
                        {expandedDay === day && (
                          <div className="p-3 sm:p-4 space-y-4">
                            {schedule[day].slots.map((slot: SlotType, i: number) => (
                              <div
                                key={i}
                                className="bg-white border border-gray-200 rounded-md p-3 sm:p-4 space-y-4"
                              >
                                {/* Slot Header - Compact */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2 sm:gap-0">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 text-sm sm:text-base">Slot {i + 1}</span>
                                    <span className="hidden sm:inline text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                      {slot.batch_id}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={slot.enabled}
                                        onChange={(e) => updateSlot(day, i, "enabled", e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                    {schedule[day].slots.length > 1 && (
                                      <button
                                        onClick={() => setConfirmDelete({ day, index: i })}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Time Configuration - Better Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                  {/* Working Hours - TOP */}
                                  <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Working Hours
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                        <div className="flex gap-1">
                                          <input
                                            type="time"
                                            value={slot.from}
                                            onChange={(e) => updateSlot(day, i, "from", e.target.value)}
                                            className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm"
                                          />
                                          <select
                                            value={slot.fromPeriod}
                                            onChange={(e) => updateSlot(day, i, "fromPeriod", e.target.value)}
                                            className="w-16 px-2 py-2 border border-gray-300 rounded text-sm bg-white"
                                          >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">End</label>
                                        <div className="flex gap-1">
                                          <input
                                            type="time"
                                            value={slot.to}
                                            onChange={(e) => updateSlot(day, i, "to", e.target.value)}
                                            className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm"
                                          />
                                          <select
                                            value={slot.toPeriod}
                                            onChange={(e) => updateSlot(day, i, "toPeriod", e.target.value)}
                                            className="w-16 px-2 py-2 border border-gray-300 rounded text-sm bg-white"
                                          >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Break Time - BELOW */}
                                  <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Break Time
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                        <div className="flex gap-1">
                                          <input
                                            type="time"
                                            value={slot.breakFrom}
                                            onChange={(e) => updateSlot(day, i, "breakFrom", e.target.value)}
                                            className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm"
                                            placeholder="--:--"
                                          />
                                          <select
                                            value={slot.breakFromPeriod}
                                            onChange={(e) => updateSlot(day, i, "breakFromPeriod", e.target.value)}
                                            className="w-16 px-2 py-2 border border-gray-300 rounded text-sm bg-white"
                                          >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 mb-1 block">End</label>
                                        <div className="flex gap-1">
                                          <input
                                            type="time"
                                            value={slot.breakTo}
                                            onChange={(e) => updateSlot(day, i, "breakTo", e.target.value)}
                                            className="flex-1 px-2 sm:px-3 py-2 border border-gray-300 rounded text-sm"
                                            placeholder="--:--"
                                          />
                                          <select
                                            value={slot.breakToPeriod}
                                            onChange={(e) => updateSlot(day, i, "breakToPeriod", e.target.value)}
                                            className="w-16 px-2 py-2 border border-gray-300 rounded text-sm bg-white"
                                          >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Token Management - DISPLAY ONLY */}
                                <div className="pt-3 border-t border-gray-100">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <div className="space-y-1">
                                      <label className="block text-sm font-medium text-gray-700">
                                        Token Limit
                                      </label>
                                      <div className="flex items-center gap-2">
                                        {/* Read-only display */}
                                        <div className="w-full sm:w-24 px-3 py-2 border border-gray-300 bg-gray-50 rounded text-sm text-gray-700">
                                          {slot.token || "0"}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleTokenUpdateClick(day, slot, i)}
                                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center gap-1"
                                    >
                                      <Settings className="h-3 w-3" />
                                      Manage Tokens
                                    </button>
                                  </div>
                                </div>

                                {/* Slot Summary - Compact */}
                                <div className="pt-2 border-t border-gray-100">
                                  <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs gap-1 xs:gap-0">
                                    <span className="text-gray-600 truncate">
                                      {slot.from && slot.to ? `${slot.from} ${slot.fromPeriod} - ${slot.to} ${slot.toPeriod}` : 'Time not set'}
                                    </span>
                                    {slot.breakFrom && slot.breakTo && (
                                      <span className="text-gray-500 text-xs">
                                        Break: {slot.breakFrom} {slot.breakFromPeriod} - {slot.breakTo} {slot.breakToPeriod}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Add Slot Button - Simple */}
                            <button
                              onClick={() => addSlot(day)}
                              className="w-full py-3 border border-dashed border-gray-300 rounded-md hover:border-blue-400 hover:bg-blue-50 text-sm flex items-center justify-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Another Time Slot
                            </button>
                          </div>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Token Update Modal */}
      {tokenModalOpen && selectedSlot && (
        <TokenUpdateModal
          isOpen={tokenModalOpen}
          onClose={() => setTokenModalOpen(false)}
          slotData={selectedSlot}
          categoryId={selectedSlot.categoryId}
          onTokenUpdated={handleTokenUpdated}
        />
      )}

      {/* Confirm Delete Modal - Cleaner */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Delete Time Slot</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-700">
                  This will remove the slot and all associated data including token history.
                </p>
              </div>

              <div className="flex flex-col xs:flex-row gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeSlot(confirmDelete.day, confirmDelete.index);
                    setConfirmDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}