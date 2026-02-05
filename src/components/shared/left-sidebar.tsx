"use client";

import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import NavLink from "./nav-link";
import { SIDEBAR_LINKS } from "../../constants";
import { currentUser } from "@/lib/api/users";
import { siteUrl } from "@/config";

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle?: () => void;
  onLinkClick?: () => void; // Add this prop
}

const LeftSidebar = ({ isCollapsed, onToggle, onLinkClick }: LeftSidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Fetch user data
    const fetchUser = async () => {
      try {
        const userData = await currentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Filter links based on user service type
  const filteredLinks = user
    ? SIDEBAR_LINKS.filter((item: any) => {
      const serviceType = user?.service_type_id;

      if (item.label === "Department" && serviceType !== 3) return false;
      if (item.label === "Categories" && (serviceType === 2 || serviceType === 3))
        return false;
      if (item.label === "Services" && serviceType === 2) return false;

      if (!item.serviceType) return true;
      return item.serviceType === serviceType;
    })
    : [];

  if (loading) {
    return (
      <div className="h-full bg-[#0D1B2A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0D1B2A] text-white flex flex-col rounded-r-xl shadow-lg border-r border-white/10">
      {/* TOGGLE BUTTON */}
      <button
        onClick={onToggle}
        className={`
    absolute -right-4 top-0
    w-8 h-8
    bg-[#0D1B2A] 
    border border-white/20 
    rounded-full
    flex items-center justify-center 
    text-white
    shadow-lg

    transition-all duration-300
    hover:bg-blue-500 hover:border-blue-400 hover:scale-110

    ${isMobile ? "hidden" : "block"}
  `}
      >
        <ChevronLeft
          size={18}
          className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
            }`}
        />
      </button>


      {/* SCROLLABLE CONTENT */}
      <div
        className={`
          flex-1 overflow-y-auto py-6
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/20
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb:hover]:bg-white/30
          hover:[&::-webkit-scrollbar-thumb]:bg-white/25
          ${isCollapsed ? "px-2" : "px-4"}
        `}
      >
        {/* HEADER */}
        <div
          className={`
            flex items-center justify-between mb-8 pb-4 
            border-b border-white/10
            ${isCollapsed ? "flex-col gap-4" : ""}
          `}
        >
          <div
            className={`
              flex items-center gap-3
              ${isCollapsed ? "flex-col" : ""}
            `}
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src={
                  user?.siteSettings?.logo_url
                    ? user.siteSettings.logo_url
                    : "/no-logo-icon.svg"
                }
                alt="Site Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            {!isCollapsed && (
              <span className="text-lg font-semibold tracking-wide truncate">
                {user?.siteName}
              </span>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`${siteUrl}/${user?.siteSlug}`}
                  target="_blank"
                  className={`
                    bg-white/10 rounded-lg flex items-center justify-center
                    hover:bg-white/15 transition-colors shrink-0
                    w-9 h-9
                  `}
                >
                  <ExternalLink size={20} />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visit Site</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* SIDEBAR LINKS - Pass onLinkClick prop */}
        <ul className="space-y-1.5 pb-10">
          {filteredLinks.map((item, index) => (
            <li key={index}>
              <NavLink
                item={item}
                isCollapsed={isCollapsed}
                onLinkClick={onLinkClick} // Pass the callback
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftSidebar;