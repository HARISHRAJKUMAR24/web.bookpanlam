"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/shared/left-sidebar";
import TopBar from "@/components/shared/topbar";
import SuspensionGuard from "@/components/SuspensionGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Function to close sidebar (for mobile)
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <SuspensionGuard>
      <div className="relative min-h-screen bg-[#f8f8f9]">
        {/* SIDEBAR */}
        <div 
          className={`
            fixed left-0 top-0 h-screen
            transition-all duration-300
            ${sidebarOpen ? 'w-[270px]' : 'w-[70px]'}
            ${isMobile ? 'z-30' : 'z-20'}
            ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
          `}
        >
          <LeftSidebar 
            isCollapsed={!sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onLinkClick={closeSidebar} // Pass close function
          />
        </div>

        {/* MAIN CONTENT */}
        <div 
          className={`
            transition-all duration-300 min-h-screen
            ${!isMobile && sidebarOpen ? 'md:pl-[270px]' : ''}
            ${!isMobile && !sidebarOpen ? 'md:pl-[70px]' : ''}
          `}
        >
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </main>
        </div>

        {/* MOBILE OVERLAY */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={closeSidebar} // Use same close function
          />
        )}
      </div>
    </SuspensionGuard>
  );
}