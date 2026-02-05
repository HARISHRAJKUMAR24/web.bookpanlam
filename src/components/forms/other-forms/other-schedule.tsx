"use client";
import { Trash2, Calendar, Clock, Users, Coffee, AlertCircle, Hash, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AvailableDaysTokenModal from "./available-days-token-modal";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SlotType = {
    batch_id: string;
    from: string;
    to: string;
    breakFrom: string;
    breakTo: string;
    token: number;
    fromPeriod: "AM" | "PM";
    toPeriod: "AM" | "PM";
    breakFromPeriod: "AM" | "PM";
    breakToPeriod: "AM" | "PM";
};

type DayScheduleType = {
    enabled: boolean;
    slots: SlotType[];
};

type ScheduleType = {
    [key: string]: DayScheduleType;
};

type Props = {
    department: any;
    onSave?: (data: any) => void;
    onValidationChange?: (hasErrors: boolean) => void;
    isSaving?: boolean;
    hideAppointmentTiming?: boolean; // ⭐ ADD THIS
};


const formatMinutesToHours = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} min`;
};

// Convert 12-hour time to 24-hour for calculations
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
function convertTo12Hour(time24: string) {
    if (!time24) {
        return {
            time: "",
            period: "AM" as "AM" | "PM",
        };
    }

    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    let period: "AM" | "PM" = "AM";

    if (hour >= 12) {
        period = "PM";
        if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;

    const formattedTime = `${String(hour).padStart(2, "0")}:${m}`;

    return {
        time: formattedTime,
        period
    };
}



// Generate batch_id: dayIndex:slotIndex (e.g., "0:0" for Sun Slot 0)
const generateBatchId = (day: string, slotIndex: number): string => {
    const dayIndex = days.indexOf(day);
    return `${dayIndex}:${slotIndex}`;
};

const validateSlot = (slot: SlotType): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!slot.from?.trim()) {
        errors.push("Start time is required");
    }

    if (!slot.to?.trim()) {
        errors.push("End time is required");
    }

    if (slot.from) {
        const [hoursStr] = slot.from.split(':');
        const hours = parseInt(hoursStr);
        if (isNaN(hours) || hours < 1 || hours > 12) {
            errors.push("Start time must be in 12-hour format (01:00 to 12:59)");
        }
    }

    if (slot.to) {
        const [hoursStr] = slot.to.split(':');
        const hours = parseInt(hoursStr);
        if (isNaN(hours) || hours < 1 || hours > 12) {
            errors.push("End time must be in 12-hour format (01:00 to 12:59)");
        }
    }

    if (slot.breakFrom) {
        const [hoursStr] = slot.breakFrom.split(':');
        const hours = parseInt(hoursStr);
        if (isNaN(hours) || hours < 1 || hours > 12) {
            errors.push("Break start time must be in 12-hour format (01:00 to 12:59)");
        }
    }

    if (slot.breakTo) {
        const [hoursStr] = slot.breakTo.split(':');
        const hours = parseInt(hoursStr);
        if (isNaN(hours) || hours < 1 || hours > 12) {
            errors.push("Break end time must be in 12-hour format (01:00 to 12:59)");
        }
    }

    if (slot.from && slot.to && slot.fromPeriod && slot.toPeriod) {
        const from24 = convertTo24Hour(slot.from, slot.fromPeriod);
        const to24 = convertTo24Hour(slot.to, slot.toPeriod);

        const fromTime = new Date(`2000/01/01 ${from24}`);
        const toTime = new Date(`2000/01/01 ${to24}`);

        if (fromTime >= toTime) {
            errors.push("End time must be after start time");
        }
    }

    if (!slot.token || slot.token < 1) {
        errors.push("Token limit must be at least 1");
    }

    if (!slot.batch_id || slot.batch_id.trim() === "") {
        errors.push("Batch ID is required");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

const calculateBreakMinutes = (breakFrom: string, breakFromPeriod: "AM" | "PM", breakTo: string, breakToPeriod: "AM" | "PM") => {
    if (!breakFrom || !breakTo || !breakFromPeriod || !breakToPeriod) return 0;

    const breakFrom24 = convertTo24Hour(breakFrom, breakFromPeriod);
    const breakTo24 = convertTo24Hour(breakTo, breakToPeriod);

    const [fromHour, fromMin] = breakFrom24.split(":").map(Number);
    const [toHour, toMin] = breakTo24.split(":").map(Number);

    return (toHour * 60 + toMin) - (fromHour * 60 + fromMin);
};

const initializeScheduleWithDefaults = (): ScheduleType => {
    const initialSchedule: ScheduleType = {};
    days.forEach(day => {
        initialSchedule[day] = {
            enabled: false,
            slots: []
        };
    });
    return initialSchedule;
};

const parseScheduleFromDatabase = (appointmentSettings: any): ScheduleType => {
    if (!appointmentSettings) {
        return initializeScheduleWithDefaults();
    }

    try {
        const settings = typeof appointmentSettings === "string"
            ? JSON.parse(appointmentSettings)
            : appointmentSettings;

        const parsedSchedule: ScheduleType = initializeScheduleWithDefaults();

        Object.keys(settings).forEach((day) => {
            if (days.includes(day) && settings[day]) {
                parsedSchedule[day] = {
                    enabled: !!settings[day].enabled,
                    slots: (settings[day].slots || []).map((slot: any, index: number) => {
                        const from = convertTo12Hour(slot.from || "");
                        const to = convertTo12Hour(slot.to || "");
                        const breakFrom = convertTo12Hour(slot.breakFrom || "");
                        const breakTo = convertTo12Hour(slot.breakTo || "");

                        const token = typeof slot.token === 'string' ? parseInt(slot.token) || 0 : (Number(slot.token) || 0);

                        return {
                            batch_id: slot.batch_id || generateBatchId(day, index),
                            from: from.time,
                            to: to.time,
                            breakFrom: breakFrom.time,
                            breakTo: breakTo.time,
                            token: token,
                            fromPeriod: from.period,
                            toPeriod: to.period,
                            breakFromPeriod: breakFrom.period,
                            breakToPeriod: breakTo.period
                        };
                    }),
                };
            }
        });

        return parsedSchedule;
    } catch (error) {
        console.error("Error parsing appointment settings:", error);
        return initializeScheduleWithDefaults();
    }
};

const calculateHours = (from: string, fromPeriod: "AM" | "PM", to: string, toPeriod: "AM" | "PM") => {
    if (!from || !to || !fromPeriod || !toPeriod) return "0.0";

    const from24 = convertTo24Hour(from, fromPeriod);
    const to24 = convertTo24Hour(to, toPeriod);

    const [fromHour, fromMin] = from24.split(':').map(Number);
    const [toHour, toMin] = to24.split(':').map(Number);
    const totalMinutes = (toHour * 60 + toMin) - (fromHour * 60 + fromMin);
    return (totalMinutes / 60).toFixed(1);
};

// Function to format schedule for API (convert to 24-hour format WITH batch_id)
const formatScheduleForApi = (schedule: ScheduleType): any => {
    const formattedSchedule: any = {};

    Object.keys(schedule).forEach(day => {
        const dayData = schedule[day];

        formattedSchedule[day] = {
            enabled: dayData.enabled,
            slots: dayData.slots.map((slot, index) => ({
                batch_id: slot.batch_id || generateBatchId(day, index),
                from: slot.from && slot.fromPeriod ? convertTo24Hour(slot.from, slot.fromPeriod) : "",
                to: slot.to && slot.toPeriod ? convertTo24Hour(slot.to, slot.toPeriod) : "",
                breakFrom: slot.breakFrom && slot.breakFromPeriod ? convertTo24Hour(slot.breakFrom, slot.breakFromPeriod) : "",
                breakTo: slot.breakTo && slot.breakToPeriod ? convertTo24Hour(slot.breakTo, slot.breakToPeriod) : "",
                token: slot.token
            }))
        };
    });

    return formattedSchedule;
};

const OtherSchedule = ({ department, onSave, onValidationChange, isSaving = false }: Props) => {
    const [schedule, setSchedule] = useState<ScheduleType>(initializeScheduleWithDefaults());
    const [confirmDelete, setConfirmDelete] = useState<{ day: string; index: number } | null>(null);
    const [touchedSlots, setTouchedSlots] = useState<Set<string>>(new Set());
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const [loading, setLoading] = useState(true);

    // Token Modal State
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        batch_id: string;
        currentToken: number;
        day: string;
        slotIndex: number;
        startTime: string;
        endTime: string;
        departmentId?: string;
    } | null>(null);

    useEffect(() => {
        if (!department) return;

        setLoading(true);

        // Parse appointment settings
        const parsedSchedule = parseScheduleFromDatabase(department.appointmentSettings);
        setSchedule(parsedSchedule);

        setTouchedSlots(new Set());
        setHasValidationErrors(false);

        // Send initial schedule data to parent
        if (onSave) {
            const formatted = formatScheduleForApi(parsedSchedule);
            onSave(formatted);
        }
        setLoading(false);
    }, [department]);

    useEffect(() => {
        let hasErrors = false;

        Object.keys(schedule).forEach(day => {
            if (schedule[day].enabled) {
                schedule[day].slots.forEach((slot) => {
                    const validation = validateSlot(slot);
                    if (!validation.isValid) {
                        hasErrors = true;
                    }
                });
            }
        });

        setHasValidationErrors(hasErrors);
        if (onValidationChange) {
            onValidationChange(hasErrors);
        }
    }, [schedule, onValidationChange]);

    const markSlotAsTouched = (day: string, index: number) => {
        setTouchedSlots(prev => new Set(prev).add(`${day}-${index}`));
    };

    const toggleDay = (day: string) => {
        const enabled = !schedule[day]?.enabled;
        const updated = {
            ...schedule,
            [day]: {
                enabled,
                slots: enabled
                    ? [
                        {
                            batch_id: generateBatchId(day, 0),
                            from: "09:00",
                            to: "05:00",
                            breakFrom: "",
                            breakTo: "",
                            token: 10,
                            fromPeriod: "AM" as "AM" | "PM",
                            toPeriod: "PM" as "AM" | "PM",
                            breakFromPeriod: "AM" as "AM" | "PM",
                            breakToPeriod: "AM" as "AM" | "PM",
                        } as SlotType
                    ]
                    : [],

            },
        };
        setSchedule(updated);

        if (onSave) {
            const formatted = formatScheduleForApi(updated);
            onSave(formatted);
        }
    };

    const updateSlot = (day: string, index: number, key: keyof SlotType, value: any) => {
        const updated = { ...schedule };

        if (!updated[day].enabled) return;

        if (key === 'from' || key === 'to' || key === 'breakFrom' || key === 'breakTo') {
            if (value) {
                const [hoursStr] = value.split(':');
                const hours = parseInt(hoursStr);
                if (hoursStr && (isNaN(hours) || hours < 1 || hours > 12)) {
                    return;
                }
            }
        }

        if (key === "token") {
            const numVal = parseInt(value);
            updated[day].slots[index][key] = isNaN(numVal) ? 0 : Math.max(1, numVal);
        } else {
            (updated[day].slots[index] as any)[key] = value;
        }

        setSchedule(updated);

        if (onSave) {
            onSave(formatScheduleForApi(updated));
        }

        if (value !== "") {
            markSlotAsTouched(day, index);
        }
    };

    const addSlot = (day: string) => {
        const updated = { ...schedule };
        const newSlotIndex = updated[day].slots.length;

        const newSlot: SlotType = {
            batch_id: generateBatchId(day, newSlotIndex),
            from: "09:00",
            to: "05:00",
            breakFrom: "",
            breakTo: "",
            token: 10,
            fromPeriod: "AM",
            toPeriod: "PM",
            breakFromPeriod: "AM",
            breakToPeriod: "AM"
        };

        updated[day].slots.push(newSlot);
        setSchedule(updated);

        if (onSave) {
            onSave(formatScheduleForApi(updated));
        }
    };

    const removeSlot = (day: string, index: number) => {
        const updated = { ...schedule };
        updated[day].slots.splice(index, 1);

        updated[day].slots.forEach((slot, idx) => {
            slot.batch_id = generateBatchId(day, idx);
        });

        setSchedule(updated);

        if (onSave) {
            onSave(formatScheduleForApi(updated));
        }

        const slotKey = `${day}-${index}`;
        setTouchedSlots(prev => {
            const newSet = new Set(prev);
            newSet.delete(slotKey);
            return newSet;
        });
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
            departmentId: department?.departmentId || department?.department_id
        });
        setTokenModalOpen(true);
    };

    // Handle token update from modal
    const handleTokenUpdated = async (newToken: number, batchId: string) => {
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

        if (onSave) {
            onSave(formatScheduleForApi(updated));
        }

        setTokenModalOpen(false);
        toast.success(`Token updated to ${newToken}`, { duration: 3000 });
    };

    const hasEnabledDays = Object.keys(schedule).some(
        (day) => schedule[day]?.enabled
    );

    const getSlotValidation = (day: string, index: number) => {
        if (!touchedSlots.has(`${day}-${index}`)) {
            return { isValid: true, errors: [] };
        }
        return validateSlot(schedule[day].slots[index]);
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 rounded-xl bg-white shadow-sm border border-gray-200">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading schedule data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">

                {/* Weekly Schedule Section */}
                <div className="p-4 sm:p-5 md:p-6 rounded-xl bg-white shadow-sm border border-gray-200">
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                                        Weekly Appointment Schedule
                                    </h2>
                                    <p className="text-gray-500 text-xs sm:text-sm">
                                        Configure weekly timings and appointment slots
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 md:mb-8">
                        <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 sm:mb-3 uppercase tracking-wide">
                            Select Working Days
                        </h3>
                        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-7 gap-2">
                            {days.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-2 md:px-3 py-2 md:py-3 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200 ${schedule[day]?.enabled
                                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/20"
                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!hasEnabledDays ? (
                        <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
                            <h3 className="font-medium text-gray-700 text-sm sm:text-base mb-1 md:mb-2">No days selected</h3>
                            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto px-4">
                                Select days above to start configuring appointment slots.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-6">
                            {Object.keys(schedule).map(
                                (day) =>
                                    schedule[day]?.enabled && (
                                        <div
                                            key={day}
                                            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                                        >
                                            <div className="bg-gradient-to-r from-gray-50 to-white px-3 sm:px-4 md:px-5 py-3 md:py-4 border-b border-gray-200">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <span className="text-blue-700 font-bold text-sm sm:text-base md:text-lg">
                                                                {day.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg">{day}day</h3>
                                                            <p className="text-gray-500 text-xs sm:text-sm">
                                                                {schedule[day].slots.length} slot{schedule[day].slots.length !== 1 ? "s" : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => addSlot(day)}
                                                        className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-1.5 md:gap-2 w-full sm:w-auto justify-center shadow-sm hover:shadow"
                                                    >
                                                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span>Add Slot</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4">
                                                {schedule[day].slots?.map((slot: SlotType, i: number) => {
                                                    const workingHours = calculateHours(slot.from, slot.fromPeriod, slot.to, slot.toPeriod);
                                                    const validation = getSlotValidation(day, i);

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`border rounded-xl p-3 sm:p-4 bg-white transition-all duration-200 ${validation.isValid
                                                                ? "border-gray-200 hover:border-gray-300"
                                                                : "border-red-200 bg-red-50/30"
                                                                }`}
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 md:mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1 sm:p-1.5 md:p-2 rounded-lg ${validation.isValid ? "bg-gray-100" : "bg-red-100"
                                                                        }`}>
                                                                        <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${validation.isValid ? "text-gray-600" : "text-red-600"
                                                                            }`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                                            <span className={`text-sm sm:text-base font-semibold ${validation.isValid ? "text-gray-800" : "text-red-700"
                                                                                }`}>
                                                                                Slot {i + 1}
                                                                            </span>
                                                                            {!validation.isValid && (
                                                                                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <Hash className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                                                            <span className="text-xs text-gray-500">Batch ID: {slot.batch_id}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1 sm:gap-2">
                                                                    {schedule[day].slots.length > 1 && (
                                                                        <button
                                                                            onClick={() => setConfirmDelete({ day, index: i })}
                                                                            className="text-red-600 hover:text-red-800 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                                        >
                                                                            <Trash2 size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
                                                                            <span>Remove Slot</span>
                                                                        </button>
                                                                    )}

                                                                </div>
                                                            </div>

                                                            {!validation.isValid && (
                                                                <div className="mb-3 md:mb-4 p-2 sm:p-2.5 bg-red-50 border border-red-100 rounded-lg">
                                                                    <ul className="space-y-1">
                                                                        {validation.errors.map((error, idx) => (
                                                                            <li key={idx} className="text-xs text-red-600 flex items-center gap-1 sm:gap-1.5">
                                                                                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                                                {error}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="space-y-4 md:space-y-6">
                                                                <div className="grid grid-cols-1 gap-4">
                                                                    {/* Working Hours - TOP */}
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                                                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                                                                            Working Hours *
                                                                        </label>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                                                                <div className="flex gap-1">
                                                                                    <input
                                                                                        type="time"
                                                                                        className={`flex-1 border rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${validation.errors.some(e => e.includes("Start time") || e.includes("End time") || e.includes("End time must be") || e.includes("12-hour format"))
                                                                                            ? "border-red-300 bg-red-50/50"
                                                                                            : "border-gray-300"
                                                                                            }`}
                                                                                        value={slot.from}
                                                                                        onChange={(e) => updateSlot(day, i, "from", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                        required
                                                                                    />
                                                                                    <select
                                                                                        className="w-16 sm:w-20 border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                                        value={slot.fromPeriod}
                                                                                        onChange={(e) => updateSlot(day, i, "fromPeriod", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
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
                                                                                        className={`flex-1 border rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${validation.errors.some(e => e.includes("Start time") || e.includes("End time") || e.includes("End time must be") || e.includes("12-hour format"))
                                                                                            ? "border-red-300 bg-red-50/50"
                                                                                            : "border-gray-300"
                                                                                            }`}
                                                                                        value={slot.to}
                                                                                        onChange={(e) => updateSlot(day, i, "to", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                        required
                                                                                    />
                                                                                    <select
                                                                                        className="w-16 sm:w-20 border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                                        value={slot.toPeriod}
                                                                                        onChange={(e) => updateSlot(day, i, "toPeriod", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                    >
                                                                                        <option value="AM">AM</option>
                                                                                        <option value="PM">PM</option>
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Break Time - BELOW */}
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                                                            <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                                                                            Break Time
                                                                        </label>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                                            <div>
                                                                                <label className="text-xs text-gray-500 mb-1 block">Start</label>
                                                                                <div className="flex gap-1">
                                                                                    <input
                                                                                        type="time"
                                                                                        className={`flex-1 border rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${validation.errors.some(e => e.includes("Break") || e.includes("12-hour format"))
                                                                                            ? "border-red-300 bg-red-50/50"
                                                                                            : "border-gray-300"
                                                                                            }`}
                                                                                        value={slot.breakFrom}
                                                                                        onChange={(e) => updateSlot(day, i, "breakFrom", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                        placeholder="HH:MM"
                                                                                    />
                                                                                    <select
                                                                                        className="w-16 sm:w-20 border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                                        value={slot.breakFromPeriod}
                                                                                        onChange={(e) => updateSlot(day, i, "breakFromPeriod", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
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
                                                                                        className={`flex-1 border rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition ${validation.errors.some(e => e.includes("Break") || e.includes("12-hour format"))
                                                                                            ? "border-red-300 bg-red-50/50"
                                                                                            : "border-gray-300"
                                                                                            }`}
                                                                                        value={slot.breakTo}
                                                                                        onChange={(e) => updateSlot(day, i, "breakTo", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                        placeholder="HH:MM"
                                                                                    />
                                                                                    <select
                                                                                        className="w-16 sm:w-20 border border-gray-300 rounded-lg p-2 sm:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                                        value={slot.breakToPeriod}
                                                                                        onChange={(e) => updateSlot(day, i, "breakToPeriod", e.target.value)}
                                                                                        onBlur={() => markSlotAsTouched(day, i)}
                                                                                    >
                                                                                        <option value="AM">AM</option>
                                                                                        <option value="PM">PM</option>
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                                                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                                                                            Token Limit *
                                                                        </label>
                                                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                                                            <div className="relative w-full sm:w-auto sm:flex-1">
                                                                                <div className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2 sm:p-2.5 text-sm text-gray-700">
                                                                                    {slot.token || "0"} tokens
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleTokenUpdateClick(day, slot, i)}
                                                                                className="px-3 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 flex items-center gap-1.5 transition-colors w-full sm:w-auto justify-center"
                                                                            >
                                                                                <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                                                                Token Update
                                                                            </button>
                                                                        </div>

                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                                            Session Summary
                                                                        </label>
                                                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 space-y-1.5 md:space-y-2">
                                                                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-0">
                                                                                <span className="text-gray-600 text-xs sm:text-sm">Working Duration:</span>
                                                                                <span className={`font-semibold text-sm sm:text-base ${slot.from && slot.to ? "text-gray-800" : "text-gray-400"}`}>
                                                                                    {slot.from && slot.to ?
                                                                                        (() => {
                                                                                            const from24 = convertTo24Hour(slot.from, slot.fromPeriod);
                                                                                            const to24 = convertTo24Hour(slot.to, slot.toPeriod);
                                                                                            const [fromHour, fromMin] = from24.split(":").map(Number);
                                                                                            const [toHour, toMin] = to24.split(":").map(Number);
                                                                                            const totalMinutes = Math.max(0, (toHour * 60 + toMin) - (fromHour * 60 + fromMin));
                                                                                            return formatMinutesToHours(totalMinutes);
                                                                                        })()
                                                                                        : "Not set"}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 xs:gap-0">
                                                                                <span className="text-gray-600 text-xs sm:text-sm">
                                                                                    Break Duration:
                                                                                </span>
                                                                                <span
                                                                                    className={`font-semibold text-sm sm:text-base ${slot.breakFrom && slot.breakTo
                                                                                        ? "text-gray-800"
                                                                                        : "text-gray-400"
                                                                                        }`}
                                                                                >
                                                                                    {slot.breakFrom && slot.breakTo
                                                                                        ? formatMinutesToHours(
                                                                                            calculateBreakMinutes(slot.breakFrom, slot.breakFromPeriod, slot.breakTo, slot.breakToPeriod)
                                                                                        )
                                                                                        : "No break"}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Token Update Modal */}
            {tokenModalOpen && selectedSlot && (
                <AvailableDaysTokenModal
                    isOpen={tokenModalOpen}
                    onClose={() => setTokenModalOpen(false)}
                    slotData={{
                        batch_id: selectedSlot.batch_id,
                        currentToken: selectedSlot.currentToken,
                        day: selectedSlot.day,
                        slotIndex: selectedSlot.slotIndex,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime
                    }}
                    departmentId={selectedSlot.departmentId}
                    onTokenUpdated={(newToken, batchId) => {
                        handleTokenUpdated(newToken, batchId);
                    }}
                />
            )}

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
                        <div className="p-4 sm:p-5 md:p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                                        Delete Time Slot
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                        Are you sure you want to remove this time slot? This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                                <button
                                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                                    onClick={() => setConfirmDelete(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm"
                                    onClick={() => {
                                        removeSlot(confirmDelete.day, confirmDelete.index);
                                        setConfirmDelete(null);
                                    }}
                                >
                                    Delete Slot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OtherSchedule;