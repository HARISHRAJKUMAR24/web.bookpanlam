"use client";

import { useState } from "react";
import TimeMenu from "./hotel-forms/TimeMenu";
import DayToggle, { Day } from "./hotel-forms/DayToggle";
import FoodSlot, { SlotData } from "./hotel-forms/FoodSlot";
import { saveHotelSettings } from "@/lib/api/hotel";
import { toast } from "sonner";

export type TimeSlot =
  | "morning"
  | "afternoon"
  | "evening"
  | "night";

export default function HotelForm() {
  const [activeTime, setActiveTime] =
    useState<TimeSlot>("morning");

  const [activeDays, setActiveDays] =
    useState<Day[]>(["mon"]);

  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  const [slots, setSlots] = useState<
    { id: number; data?: SlotData }[]
  >([{ id: Date.now() }]);

  /* ---------------------------
     SLOT HANDLERS
  ---------------------------- */
  const addSlot = () => {
    setSlots([...slots, { id: Date.now() }]);
  };

  const removeSlot = (id: number) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const saveSlotData = (id: number, data: SlotData) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, data } : s
      )
    );
  };

  /* ---------------------------
     SAVE TO DB
  ---------------------------- */
  const handleSave = async () => {
    if (!timeFrom || !timeTo) {
      toast.error("Please select time range");
      return;
    }

    const menu = slots
      .map((s) => s.data)
      .filter(Boolean) as SlotData[];

    if (!menu.length) {
      toast.error("Please save at least one slot");
      return;
    }

    try {
      for (const day of activeDays) {
        const payload = {
          day,
          time_slot: activeTime,
          time_from: timeFrom,
          time_to: timeTo,
          menu,
        };

        console.log("📤 FINAL PAYLOAD:", payload);

        const res = await saveHotelSettings(payload);

        console.log("📥 API RESPONSE:", res);

        // ✅ FIXED CONDITION
        if (res?.success === false) {
          toast.error(
            res?.message || "Failed to save hotel settings"
          );
          return;
        }
      }

      toast.success("Hotel settings saved successfully");
    } catch (err) {
      console.error("SAVE ERROR:", err);
      toast.error("Something went wrong while saving");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* 🔹 LEFT SIDE */}
      <div className="col-span-9 border rounded-lg p-5 bg-white shadow space-y-6">
        <TimeMenu
          active={activeTime}
          onChange={setActiveTime}
        />

        <DayToggle
          activeDays={activeDays}
          onChange={setActiveDays}
        />

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="time"
            className="border p-2 rounded"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
          />
          <input
            type="time"
            className="border p-2 rounded"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
          />
        </div>

        {/* Slots */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">
              Menu ({activeTime})
            </h2>

            <button
              type="button"
              onClick={addSlot}
              className="text-blue-600 text-sm font-medium"
            >
              + Add Slot
            </button>
          </div>

          {slots.map((slot) => (
            <FoodSlot
              key={slot.id}
              onRemove={() => removeSlot(slot.id)}
              onSave={(data) =>
                saveSlotData(slot.id, data)
              }
            />
          ))}
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-4 border-t">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Save Hotel Settings
          </button>
        </div>
      </div>

      {/* 🔹 RIGHT SIDE (future tables) */}
      <div className="col-span-3 space-y-4" />
    </div>
  );
}
