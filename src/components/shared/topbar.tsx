"use client";

import React, { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

import { Notification, More, Logout as LogoutIcon, Menu } from "iconsax-react";
import Logout from "../logout";
import { MY_ACCOUNT_DROPDOWN_OPTIONS } from "@/constants";
import Link from "next/link";
import axios from "axios";
import { apiUrl } from "@/config";

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // 🔥 Fetch appointment notifications
  const loadNotifications = async () => {
    try {
      const res = await axios.get(
        `${apiUrl}/seller/appointments/get-user-appointments.php`,
        { withCredentials: true }
      );

      setNotifications(res.data.records || []);
    } catch (err) {
      console.log("NOTIFICATION ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unseenCount = notifications.length;

  return (
    <div className="bg-white py-3 px-4 md:px-8 flex items-center justify-between shadow-sm border-b">
      
      {/* LEFT SIDE - MOBILE MENU ONLY */}
      {isMobile && onMenuClick && (
        <button
          onClick={onMenuClick}
          className="w-10 h-10 bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size="20" variant="Bold" />
        </button>
      )}

      {/* RIGHT SIDE - ALWAYS ALIGN RIGHT */}
      <div className="ml-auto flex items-center gap-3 md:gap-5">
        {/* 🔔 NOTIFICATION DROPDOWN */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative outline-none">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                <Notification size={isMobile ? "18" : "20"} variant="Bulk" />
              </div>

              {/* 🔴 Red Badge with count */}
              {unseenCount > 0 && (
                <div className="absolute -top-1 -right-1">
                  <span className="relative flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-xs text-white flex items-center justify-center font-semibold border border-white">
                      {unseenCount > 9 ? "9+" : unseenCount}
                    </span>
                  </span>
                </div>
              )}
            </button>
          </PopoverTrigger>

          {/* 🔥 POPUP CONTENT */}
          <PopoverContent 
            className="w-[90vw] max-w-sm md:w-80 p-0 bg-white rounded-lg shadow-xl border"
            align="end"
            sideOffset={5}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b font-semibold text-gray-700 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <span className="flex items-center gap-2">
                <Notification size="16" variant="Bulk" className="text-red-500" />
                Notifications {unseenCount > 0 ? `(${unseenCount})` : ''}
              </span>
              <button
                onClick={loadNotifications}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
              >
                Refresh
              </button>
            </div>

            {/* BODY */}
            <div className="max-h-64 md:max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3"></div>
                  <p className="text-sm text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Notification size="24" variant="Outline" className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((item: any) => (
                    <div
                      key={item.appointment_id}
                      className="p-4 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm text-gray-800 truncate">
                              #{item.appointment_id}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                              item.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 truncate">
                            {item.doctor_name
                              ? `Dr. ${item.doctor_name}`
                              : item.service_name || 'Service'}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-400">
                              {item.payment_method ? `${item.payment_method?.toUpperCase()} • ` : ''}
                              {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              }) : ''}
                            </div>
                            
                            <Link
                              href={`/appointments/${item.appointment_id}`}
                              className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap ml-2 px-2 py-1 rounded hover:bg-blue-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Only show when there are notifications */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                <Link
                  href="/appointments"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                >
                  View all appointments
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* ACCOUNT DROPDOWN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 text-gray-700 rounded-full flex items-center justify-center outline-none hover:bg-gray-100 transition-colors">
              <More variant="Bold" size={isMobile ? "18" : "20"} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            className="w-56 md:w-64" 
            align="end"
            sideOffset={5}
          >
            <DropdownMenuLabel className="text-sm md:text-base font-semibold">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {MY_ACCOUNT_DROPDOWN_OPTIONS.map((item) => (
                <Link key={item.href} href={item.href} className="block">
                  <DropdownMenuItem className="py-2.5 md:py-3 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        {React.cloneElement(item.icon, {
                          size: 16,
                          className: "text-gray-600",
                          variant: "Bold",
                        })}
                      </div>
                      <span className="text-sm md:text-base">{item.label}</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <Logout>
              <DropdownMenuItem className="py-2.5 md:py-3 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer hover:bg-red-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                    <LogoutIcon size={16} className="text-red-600" variant="Bold" />
                  </div>
                  <span className="text-sm md:text-base font-medium">Log out</span>
                </div>
              </DropdownMenuItem>
            </Logout>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;