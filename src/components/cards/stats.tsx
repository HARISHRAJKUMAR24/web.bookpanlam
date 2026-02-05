"use client";
import { StatsCardProps } from "@/types";

const Stats = ({ icon, value, label, color }: StatsCardProps) => {
  let bg_50 = "bg-gray-50";
  let text_500 = "text-gray-500";
  let fill_500 = "[&_path]:fill-gray-500";

  switch (color) {
    case "red":
      bg_50 = "bg-red-50";
      text_500 = "text-red-500";
      fill_500 = "[&_path]:fill-red-500";
      break;

    case "green":
      bg_50 = "bg-green-50";
      text_500 = "text-green-500";
      fill_500 = "[&_path]:fill-green-500";
      break;

    case "blue":
      bg_50 = "bg-blue-50";
      text_500 = "text-blue-500";
      fill_500 = "[&_path]:fill-blue-500";
      break;

    case "orange":
      bg_50 = "bg-orange-50";
      text_500 = "text-orange-500";
      fill_500 = "[&_path]:fill-orange-500";
      break;

    case "yellow":
      bg_50 = "bg-yellow-50";
      text_500 = "text-yellow-500";
      fill_500 = "[&_path]:fill-yellow-500";
      break;

    default:
      break;
  }

  return (
    <div className="bg-white p-5 rounded-lg flex items-center justify-between flex-col 2xl:flex-row gap-5 relative">
      <div className="flex items-center 2xl:items-start flex-col">
        <div
          className={`w-12 h-12 text-2xl ${bg_50} ${text_500} rounded-full flex items-center justify-center`}
        >
          {icon}
        </div>

        <div className="mt-5 flex 2xl:items-start items-center flex-col">
          <span className="block text-2xl font-semibold">{value}</span>
          <span className="block text-sm text-black/40 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
