"use client";

export type Day =
  | "sun"
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat";

interface Props {
  activeDays: Day[];
  onChange: (days: Day[]) => void;
  disabledDays?: Day[];
}

const days: Day[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export default function DayToggle({
  activeDays,
  onChange,
  disabledDays = [],
}: Props) {
  const toggleDay = (day: Day) => {
    if (disabledDays.includes(day)) return;

    if (activeDays.includes(day)) {
      onChange(activeDays.filter((d) => d !== day));
    } else {
      onChange([...activeDays, day]);
    }
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-3 text-center">
        {days.map((day) => {
          const isActive = activeDays.includes(day);
          const isDisabled = disabledDays.includes(day);

          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-2 p-2 rounded-md transition ${
                isActive ? "bg-green-50" : ""
              } ${isDisabled ? "opacity-40" : ""}`}
            >
              {/* Day label */}
              <span
                className={`uppercase text-xs font-semibold ${
                  isActive
                    ? "text-green-700"
                    : "text-gray-600"
                }`}
              >
                {day}
              </span>

              {/* Switch */}
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => toggleDay(day)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isDisabled
                    ? "bg-gray-200 cursor-not-allowed"
                    : isActive
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isActive
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
