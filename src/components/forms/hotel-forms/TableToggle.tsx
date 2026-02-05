"use client";

import TableCard from "./TableCard";

interface Props {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const dummyTables = [
  { name: "A", seats: 2 },
  { name: "B", seats: 4 },
  { name: "C", seats: 2 },
  { name: "D", seats: 4 },
];

export default function TableToggle({
  enabled,
  onChange,
}: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Tables
          </h3>
          <p className="text-xs text-gray-500">
            Enable table management
          </p>
        </div>

        {/* Switch */}
        <button
          type="button"
          onClick={() => onChange(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled
                ? "translate-x-5"
                : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Tables */}
      {enabled && (
        <div className="mt-5 grid grid-cols-2 gap-4 justify-items-center">
          {dummyTables.map((table) => (
            <TableCard
              key={table.name}
              name={table.name}
              seats={table.seats}
            />
          ))}
        </div>
      )}
    </div>
  );
}
