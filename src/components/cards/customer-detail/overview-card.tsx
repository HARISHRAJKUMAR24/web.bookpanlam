import { CustomerOverviewCardProps } from "@/types";
import React from "react";

const OverviewCard = ({
  value,
  label,
  icon,
  color,
}: CustomerOverviewCardProps) => {
  let bg_color = "bg-primary/10";
  let text_color = "text-primary";
  let border_color = "border-primary";

  switch (color) {
    case "red":
      bg_color = "bg-red-500/10";
      text_color = "text-red-500";
      border_color = "border-red-500";
      break;

    case "blue":
      bg_color = "bg-blue-500/10";
      text_color = "text-blue-500";
      border_color = "border-blue-500";
      break;

    case "green":
      bg_color = "bg-green-500/10";
      text_color = "text-green-500";
      border_color = "border-green-500";
      break;

    case "yellow":
      bg_color = "bg-yellow-500/10";
      text_color = "text-yellow-500";
      border_color = "border-yellow-500";
      break;

    case "orange":
      bg_color = "bg-orange-500/10";
      text_color = "text-orange-500";
      border_color = "border-orange-500";
      break;

    case "indigo":
      bg_color = "bg-indigo-500/10";
      text_color = "text-indigo-500";
      border_color = "border-indigo-500";
      break;

    case "lime":
      bg_color = "bg-lime-500/10";
      text_color = "text-lime-500";
      border_color = "border-lime-500";
      break;
  }

  return (
    <div
      className={`${bg_color} border ${border_color} ${text_color} py-3 px-3 rounded-lg flex items-center justify-center flex-col`}
    >
      {React.cloneElement(icon, {
        size: 48,
        variant: "Bold",
      })}
      <p className={`${text_color} font-bold text-xl uppercase text-center`}>
        {value}
      </p>
      <p className="text-black/50 text-center mt-0.5">{label}</p>
    </div>
  );
};

export default OverviewCard;
