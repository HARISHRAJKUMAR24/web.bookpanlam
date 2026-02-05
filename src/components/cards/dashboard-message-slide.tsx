"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface Message {
  id: number;
  title: string;
  description: string;
  expiry_date?: string;
  seller_type?: any;
  just_created_seller?: number;
  message_created_at?: string;
}

interface Props {
  messages: any[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;   // ⭐ add this
  showDots?: boolean;       // ⭐ add this
}


// 10 pleasant background colors
const BG_COLORS = [
  "bg-gradient-to-r from-blue-100 to-blue-50",
  "bg-gradient-to-r from-green-100 to-green-50",
  "bg-gradient-to-r from-amber-100 to-amber-50",
  "bg-gradient-to-r from-purple-100 to-purple-50",
  "bg-gradient-to-r from-teal-100 to-teal-50",
  "bg-gradient-to-r from-indigo-100 to-indigo-50",
  "bg-gradient-to-r from-emerald-100 to-emerald-50",
  "bg-gradient-to-r from-violet-100 to-violet-50",
  "bg-gradient-to-r from-sky-100 to-sky-50",
  "bg-gradient-to-r from-lime-100 to-lime-50",
] as const;

// Text colors to match backgrounds
const TEXT_COLORS = [
  { title: "text-blue-900", desc: "text-blue-700" },
  { title: "text-green-900", desc: "text-green-700" },
  { title: "text-amber-900", desc: "text-amber-700" },
  { title: "text-purple-900", desc: "text-purple-700" },
  { title: "text-teal-900", desc: "text-teal-700" },
  { title: "text-indigo-900", desc: "text-indigo-700" },
  { title: "text-emerald-900", desc: "text-emerald-700" },
  { title: "text-violet-900", desc: "text-violet-700" },
  { title: "text-sky-900", desc: "text-sky-700" },
  { title: "text-lime-900", desc: "text-lime-700" },
] as const;

// Dot colors
const DOT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-lime-500",
] as const;

export default function DashboardMessageSlide({
  messages,
  autoPlay = true,
  interval = 5000,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Get color for current index
  const getColorIndex = useCallback((index: number) => {
    return index % BG_COLORS.length;
  }, []);

  const currentColorIndex = getColorIndex(currentIndex);

  /* ---------------------------------
     Auto play
  ----------------------------------*/
  useEffect(() => {
    if (!isPlaying || messages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === messages.length - 1 ? 0 : prev + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, messages.length, interval]);

  const goToPrev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? messages.length - 1 : prev - 1
    );

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === messages.length - 1 ? 0 : prev + 1
    );
  }, [messages.length]);

  const togglePlayPause = () => setIsPlaying((p) => !p);

  if (messages.length === 0) return null;

  /* ---------------------------------
     Current message
  ----------------------------------*/
  const currentMessage = messages[currentIndex];

  /* ---------------------------------
     Single message
  ----------------------------------*/
  if (messages.length === 1) {
    return (
      <div className={`${BG_COLORS[currentColorIndex]} rounded-xl p-6 text-center shadow-sm`}>
        <h3 className={`${TEXT_COLORS[currentColorIndex].title} font-semibold text-lg mb-2`}>
          {currentMessage.title}
        </h3>
        <p className={`${TEXT_COLORS[currentColorIndex].desc} text-sm leading-relaxed max-w-2xl mx-auto`}>
          {currentMessage.description}
        </p>
      </div>
    );
  }

  /* ---------------------------------
     Slideshow
  ----------------------------------*/
  return (
    <div className="space-y-4">
      {/* Message Content - Centered */}
      <div className={`${BG_COLORS[currentColorIndex]} rounded-xl p-6 text-center shadow-sm transition-all duration-300`}>
        <h3 className={`${TEXT_COLORS[currentColorIndex].title} font-semibold text-lg mb-3`}>
          {currentMessage.title}
        </h3>
        <p className={`${TEXT_COLORS[currentColorIndex].desc} text-sm leading-relaxed max-w-2xl mx-auto`}>
          {currentMessage.description}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-2">
        {/* Left side: Dots */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {messages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? `w-6 ${DOT_COLORS[getColorIndex(index)]}`
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to message ${index + 1}`}
              />
            ))}
          </div>
          <span className={`text-xs ${TEXT_COLORS[currentColorIndex].desc}`}>
            {currentIndex + 1} / {messages.length}
          </span>
        </div>

        {/* Right side: Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={togglePlayPause}
            className={`p-2 rounded-lg ${TEXT_COLORS[currentColorIndex].desc} hover:bg-white/70 hover:shadow-sm transition-all`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            onClick={goToPrev}
            className={`p-2 rounded-lg ${TEXT_COLORS[currentColorIndex].desc} hover:bg-white/70 hover:shadow-sm transition-all`}
            aria-label="Previous message"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={goToNext}
            className={`p-2 rounded-lg ${TEXT_COLORS[currentColorIndex].desc} hover:bg-white/70 hover:shadow-sm transition-all`}
            aria-label="Next message"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}