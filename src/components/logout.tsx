"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api/auth"; // Import from your API library

export default function Logout({ children, className }: any) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Call backend logout API (this will clear API token in DB)
      await logoutUser();
      
      // 2. Remove cookies on client side
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // 3. Refresh server-side state
      router.refresh();
      
      // 4. Redirect to login page
      router.replace("/login");
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, still clear cookies and redirect
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.replace("/login");
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}