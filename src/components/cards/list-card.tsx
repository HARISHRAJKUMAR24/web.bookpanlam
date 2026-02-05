import React from "react";
import { ListCardProps } from "@/types";

const ListCard = ({ title, icon, list, color }: ListCardProps) => {
  let bg = "bg-primary";
  let border = "border-primary";

  switch (color) {
    case "red":
      bg = "bg-red-600";
      border = "border-red-500";
      break;
    case "blue":
      bg = "bg-blue-600";
      border = "border-blue-500";
      break;
    case "green":
      bg = "bg-green-600";
      border = "border-green-500";
      break;
    case "orange":
      bg = "bg-orange-600";
      border = "border-orange-500";
      break;
    case "indigo":
      bg = "bg-indigo-600";
      border = "border-indigo-500";
      break;

    default:
      break;
  }

  return (
    <div className={`${bg} text-white rounded-xl p-5`}>
      {title && (
        <h4 className="text-lg font-semibold mb-10 flex items-center gap-3">
          <span className="mobile_l:block hidden">
            {icon &&
              React.cloneElement(icon, {
                variant: `Bold`,
              })}
          </span>
          {title}
        </h4>
      )}

      <ul>
        {list.map((item, index: number, row) => (
          <li
            key={index}
            className={`flex justify-between flex-wrap gap-5 text-sm ${
              index + 1 !== row.length && "pb-4 mb-4 border-b " + border
            }`}
          >
            <div className="text-white/90 flex gap-2">
              {item.icon &&
                React.cloneElement(item.icon, {
                  variant: `Bold`,
                })}
              <span className="font-semibold">{item.label}</span>
            </div>

            <div className="flex justify-end">
              <span className="font-bold text-white text-right">
                {item.value}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListCard;
