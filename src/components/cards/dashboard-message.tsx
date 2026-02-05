"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  description: string;
  type?: "blue" | "green" | "amber" | "purple" | "teal" | "indigo" | "emerald" | "violet" | "sky" | "lime";
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function DashboardMessage({ 
  title, 
  description, 
  type = "blue",
  dismissible = false,
  onDismiss 
}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const typeConfig = {
    blue: {
      gradient: "from-blue-50/90 via-blue-50/80 to-cyan-50/90",
      border: "border-blue-200/80",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      textColor: "text-blue-700/90",
icon: <Info size={22} />,
      glow: "shadow-sm shadow-blue-100"
    },
    green: {
      gradient: "from-green-50/90 via-green-50/80 to-emerald-50/90",
      border: "border-green-200/80",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      textColor: "text-green-700/90",
icon: <Info size={22} />,
      glow: "shadow-sm shadow-green-100"
    },
    amber: {
      gradient: "from-amber-50/90 via-amber-50/80 to-orange-50/90",
      border: "border-amber-200/80",
      iconColor: "text-amber-600",
      titleColor: "text-amber-900",
      textColor: "text-amber-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-amber-100"
    },
    purple: {
      gradient: "from-purple-50/90 via-purple-50/80 to-violet-50/90",
      border: "border-purple-200/80",
      iconColor: "text-purple-600",
      titleColor: "text-purple-900",
      textColor: "text-purple-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-purple-100"
    },
    teal: {
      gradient: "from-teal-50/90 via-teal-50/80 to-cyan-50/90",
      border: "border-teal-200/80",
      iconColor: "text-teal-600",
      titleColor: "text-teal-900",
      textColor: "text-teal-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-teal-100"
    },
    indigo: {
      gradient: "from-indigo-50/90 via-indigo-50/80 to-blue-50/90",
      border: "border-indigo-200/80",
      iconColor: "text-indigo-600",
      titleColor: "text-indigo-900",
      textColor: "text-indigo-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-indigo-100"
    },
    emerald: {
      gradient: "from-emerald-50/90 via-emerald-50/80 to-green-50/90",
      border: "border-emerald-200/80",
      iconColor: "text-emerald-600",
      titleColor: "text-emerald-900",
      textColor: "text-emerald-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-emerald-100"
    },
    violet: {
      gradient: "from-violet-50/90 via-violet-50/80 to-purple-50/90",
      border: "border-violet-200/80",
      iconColor: "text-violet-600",
      titleColor: "text-violet-900",
      textColor: "text-violet-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-violet-100"
    },
    sky: {
      gradient: "from-sky-50/90 via-sky-50/80 to-blue-50/90",
      border: "border-sky-200/80",
      iconColor: "text-sky-600",
      titleColor: "text-sky-900",
      textColor: "text-sky-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-sky-100"
    },
    lime: {
      gradient: "from-lime-50/90 via-lime-50/80 to-green-50/90",
      border: "border-lime-200/80",
      iconColor: "text-lime-600",
      titleColor: "text-lime-900",
      textColor: "text-lime-700/90",
      icon: <Info size={22} />,
      glow: "shadow-sm shadow-lime-100"
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div className={`relative rounded-xl border ${config.border} bg-gradient-to-r ${config.gradient} p-5 flex gap-4 ${config.glow} transition-all duration-300 hover:shadow-md`}>
      {/* Icon */}
      <div className="shrink-0">
        <div className={`${config.iconColor} bg-white p-2.5 rounded-lg border border-white/70 shadow-xs`}>
          {config.icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={`font-semibold text-base ${config.titleColor} mb-1.5`}>
              {title}
            </h2>
            <p className={`text-sm leading-relaxed ${config.textColor} max-w-3xl`}>
              {description}
            </p>
          </div>
          
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="shrink-0 text-gray-400 hover:text-gray-600 hover:bg-white/50 p-1 rounded transition-colors duration-200"
              aria-label="Dismiss message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}