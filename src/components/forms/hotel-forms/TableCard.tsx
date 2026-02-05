"use client";

import { useState } from "react";

interface Props {
  name: string;     // A, B, C
  seats: number;   // 2, 4, 6
}

export default function TableCard({ name, seats }: Props) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div
      className={`
        flex items-center justify-between
        w-full max-w-xs
        border rounded-lg
        px-4 py-3
        bg-white
        shadow-sm
        transition
        ${!enabled ? "opacity-50" : ""}
      `}
    >
      {/* Left: Table Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-slate-800 text-white flex items-center justify-center font-semibold">
          {name}
        </div>

        <div className="text-sm font-medium text-gray-700">
          Table {name}
        </div>
      </div>

      {/* Right: Seats + Toggle */}
      <div className="flex items-center gap-3">
        {/* Seats badge */}
        <div className="px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
          {seats} Seats
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            enabled ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
