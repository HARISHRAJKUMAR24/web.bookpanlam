"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ChefHat,
  Star,
  TrendingUp,
} from "lucide-react";
import type { MenuType } from "./menu-list";

interface Props {
  menu: MenuType;
  onRename: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MenuCard({ menu, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRename = () => {
    setOpen(false);
    onRename(menu.id); 
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete(menu.id); 
  };

  // Color helper
  const getMenuColor = (name: string) => {
    const colors = [
      {
        bg: "bg-gradient-to-r from-orange-50 to-amber-50",
        border: "border-orange-200",
        text: "text-orange-700",
        accent: "bg-orange-500",
      },
      {
        bg: "bg-gradient-to-r from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-700",
        accent: "bg-green-500",
      },
      {
        bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
        border: "border-blue-200",
        text: "text-blue-700",
        accent: "bg-blue-500",
      },
      {
        bg: "bg-gradient-to-r from-purple-50 to-pink-50",
        border: "border-purple-200",
        text: "text-purple-700",
        accent: "bg-purple-500",
      },
      {
        bg: "bg-gradient-to-r from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-700",
        accent: "bg-red-500",
      },
    ];

    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const color = getMenuColor(menu.name);

  return (
    <div
      className={`group relative w-full max-w-sm rounded-2xl border-2 ${color.border} ${color.bg} p-6 shadow-lg transition-all hover:shadow-2xl`}
    >
      <div className={`absolute top-0 left-0 w-full h-2 ${color.accent} rounded-t-2xl`} />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-xl border shadow-sm">
              <ChefHat className={color.text} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{menu.name}</h3>
              <p className="text-sm text-gray-500">
                {menu.items} items
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg bg-white border hover:shadow"
            >
              <MoreVertical size={18} />
            </button>

            {open && (
              <div className="absolute right-0 top-10 w-48 rounded-lg border bg-white shadow-lg z-50">
                <button
                  onClick={handleRename}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <Pencil size={14} /> Rename
                </button>

                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white border rounded text-center">
            <div className="font-bold">{menu.items * 12}</div>
            <div className="text-xs text-gray-500">Orders</div>
          </div>
          <div className="p-3 bg-white border rounded text-center">
            <div className="font-bold">₹{menu.items * 450}</div>
            <div className="text-xs text-gray-500">Revenue</div>
          </div>
          <div className="p-3 bg-white border rounded text-center">
            <div className="font-bold">96%</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
