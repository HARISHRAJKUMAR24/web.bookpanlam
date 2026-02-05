"use client";
import React from "react";
import Link from "next/link";
import { LinkCardProps } from "@/types";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const LinkCard = ({ title, icon, link, className }: LinkCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => link && router.push(link)}
      className={`bg-white rounded-xl p-5 flex items-center justify-between sm:flex-row flex-col sm:gap-5 gap-3 cursor-pointer group ${className}`}
    >
      <div className="flex items-center flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {icon && (
          <div className="bg-gray-100 text-gray-500 w-12 h-12 flex items-center justify-center rounded-xl">
            {React.cloneElement(icon, {
              size: 24,
              width: 24,
              height: 24,
            })}
          </div>
        )}

        <p className="text-base font-medium text-center sm:text-left">
          {title}
        </p>
      </div>

      {link && (
        <div className="w-full sm:w-auto">
          <Link
            href={link}
            className="transition group-hover:translate-x-1 hidden sm:block"
          >
            <ChevronRight />
          </Link>

          <Link href={link} className="sm:hidden block">
            <Button size="sm" type="button" className="w-full">
              View
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LinkCard;
