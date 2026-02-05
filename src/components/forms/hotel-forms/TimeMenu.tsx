"use client";

import { TimeSlot } from "../hotel-form";

interface Props {
  active: TimeSlot;
  onChange: (value: TimeSlot) => void;
}

const menus: TimeSlot[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

export default function TimeMenu({
  active,
  onChange,
}: Props) {
  return (
    <div className="flex gap-2 border-b pb-3">
      {menus.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-4 py-2 rounded capitalize ${
            active === item
              ? "bg-blue-600 text-white"
              : "bg-gray-100"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
