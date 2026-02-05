"use client";
import { SETTINGS_LINKS } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const SettingsSidebar = () => {
  const pathname = usePathname();
  return (
    <div className="h-full bg-white rounded-xl py-2 px-4">
      <ul>
        {SETTINGS_LINKS.map((item, index, row) => (
          <li key={index}>
            <Link
              href={item.href}
              className={`flex items-center gap-2.5 py-3 font-medium text-sm ${
                row.length !== index + 1 && "border-b"
              } ${
                pathname === item.href ? "text-primary" : "text-gray-500"
              } transition hover:text-gray-600`}
            >
              {React.cloneElement(item.icon, {
                size: 22,
                variant: pathname === item.href ? "Bold" : "Linear",
              })}

              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettingsSidebar;
