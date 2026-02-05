"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { NavLinkProps } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  item: NavLinkProps;
  isCollapsed: boolean;
  onLinkClick?: () => void; // Add this prop
}

const NavLink = ({ item, isCollapsed, onLinkClick }: Props) => {
  const pathname = usePathname();
  const hasChildren = Boolean(item.children);
  
  // STRICT ACTIVE CHECK
  const isParentActive =
    hasChildren &&
    item.children?.some(
      (child) =>
        pathname === child.href || pathname.startsWith(child.href + "/")
    );

  const isActive =
    !hasChildren &&
    (pathname === item.href ||
      pathname.startsWith(item.href + "/"));

  const [open, setOpen] = useState(false);

  // Auto open dropdown when inside child path
  useEffect(() => {
    if (hasChildren) {
      setOpen(Boolean(isParentActive));
    }
  }, [pathname, hasChildren, isParentActive]);

  // Handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick(); // This will close the sidebar on mobile
    }
  };

  // Handle dropdown item click
  const handleDropdownItemClick = () => {
    if (onLinkClick) {
      onLinkClick(); // This will close the sidebar on mobile
    }
  };

  /* ----------------------------------------------------
     PARENT ITEM (WITH DROPDOWN)
  ---------------------------------------------------- */
  if (hasChildren) {
    // Collapsed state - show only icon with tooltip
    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                  w-full flex items-center justify-center p-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isParentActive
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded state - show full dropdown
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg
            transition-all duration-200
            ${
              isParentActive
                ? "bg-purple-600 text-white shadow-sm"
                : "text-white/80 hover:bg-white/10"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>

          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Sub Menu */}
        <div
          className={`
            overflow-hidden transition-all duration-300
            ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="mt-2 ml-5 pl-4 space-y-1 border-l border-white/15">
            {item.children?.map((child) => {
              const childActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={handleDropdownItemClick} // Add click handler
                  className={`
                    group flex items-center gap-3 px-2 py-2 rounded-md
                    text-sm transition-all
                    ${
                      childActive
                        ? "text-purple-400 font-medium bg-white/5"
                        : "text-white/65 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5 w-1.5 rounded-full transition
                      ${childActive ? "bg-purple-400" : "bg-white/30"}
                    `}
                  />

                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
     NORMAL LINK
  ---------------------------------------------------- */
  
  // Collapsed state - show only icon with tooltip
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href!}
              onClick={handleLinkClick} // Add click handler
              className={`
                w-full flex items-center justify-center p-2.5 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-white/80 hover:bg-white/10"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded state - show full link
  return (
    <Link
      href={item.href!}
      onClick={handleLinkClick} // Add click handler
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all
        ${
          isActive
            ? "bg-purple-600 text-white shadow-sm"
            : "text-white/80 hover:bg-white/10"
        }
      `}
    >
      <span className="text-xl">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
};

export default NavLink;