"use client";
import { Link1 } from "iconsax-react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

import {CopyLinkProps} from "@/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";



const CopyLink = ({ text, link, disabled = false }: CopyLinkProps) => {
  const handleCopy = () => {
    if (!disabled) navigator.clipboard.writeText(link);
  };

  return (
    <div
      className={`rounded-xl p-5 flex items-end justify-between sm:flex-row flex-col gap-3
      ${disabled ? "opacity-60 cursor-not-allowed bg-gray-200" : "bg-white"}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl
          ${disabled ? "bg-gray-300 text-gray-500" : "bg-primary/10 text-primary"}`}
        >
          <Link1 size={24} />
        </div>

        <div>
          <span className="block mb-0.5 text-xs text-black/70">{text}</span>

          <Link
            href={disabled ? "#" : link}
            target="_blank"
            className={`underline flex items-center gap-2
            ${disabled ? "pointer-events-none text-gray-500" : "text-primary"}`}
          >
            {!disabled ? link : "Not available"}
            {!disabled && <ExternalLink width={16} height={16} />}
          </Link>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={handleCopy} disabled={disabled}>
              Copy
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabled ? "Link unavailable" : "Click to copy"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default CopyLink;
