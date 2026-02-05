import { COLOR_MAP } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import * as XLSX from "xlsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function greet() {
  var time = new Date().getHours();
  var greeting;

  if (time >= 5 && time < 12) {
    greeting = "Good morning!";
  } else if (time >= 12 && time < 18) {
    greeting = "Good afternoon!";
  } else if (time >= 18 && time < 22) {
    greeting = "Good evening!";
  } else {
    greeting = "Good night!";
  }

  return greeting;
}

export function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("");
}

export function abbreviateNumber(num: number, toFixed = 1) {
  if (num >= 1e6) {
    return (num / 1e6).toFixed(toFixed) + "M";
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(toFixed) + "k";
  }
  return num?.toString();
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 }).format(
    number
  );
}

/**
 * Format date for display (responsive)
 * @param date - Date object
 * @param formatType - 'short' for mobile, 'long' for desktop
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatType: 'short' | 'long' = 'long'): string {
  if (formatType === 'short') {
    // For mobile: "26 Jan" format
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  }
  // For desktop: "26 Jan 2024" format
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format date with time (responsive)
 * @param date - Date object or string
 * @param showTime - Whether to include time
 * @param formatType - 'short' for mobile, 'long' for desktop
 * @returns Formatted date/time string
 */
export function formatDateTime(
  date: Date | string, 
  showTime: boolean = false, 
  formatType: 'short' | 'long' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const dateStr = formatDate(dateObj, formatType);
  
  if (!showTime) {
    return dateStr;
  }

  // Format time (12-hour format)
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return formatType === 'short' 
    ? `${dateStr}, ${timeStr.replace(' ', '')}` // Compact format for mobile
    : `${dateStr} at ${timeStr}`; // Full format for desktop
}

/**
 * Format date for table display (optimized for tables)
 * @param date - Date object or string
 * @returns Formatted date string optimized for tables
 */
export function formatDateForTable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'N/A';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (dateObj.toDateString() === today.toDateString()) {
    return `Today, ${dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }

  // Check if it's yesterday
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }

  // For older dates, show date only
  return formatDate(dateObj, 'short');
}

export function formatFileSize(fileSizeInBytes: number) {
  const fileSizeInKB = fileSizeInBytes / 1024;
  const fileSizeInMB = fileSizeInKB / 1024;
  const fileSizeInGB = fileSizeInMB / 1024;

  if (fileSizeInGB >= 1) {
    return fileSizeInGB.toFixed(2) + " GB";
  } else if (fileSizeInMB >= 1) {
    return fileSizeInMB.toFixed(2) + " MB";
  } else {
    return fileSizeInKB.toFixed(2) + " KB";
  }
}

export function handleToast(response: { message: string; success: boolean }) {
  response.success
    ? toast.success(response.message)
    : toast.error(response.message);
}

export function getFileFromURL(url: string) {
  return fetch(url)
    .then((response) => response.blob())
    .catch((error) => {
      console.error("Error fetching file:", error);
      throw error;
    });
}

/**
 * Limit string length with ellipsis (responsive)
 * @param str - Input string
 * @param maxLength - Maximum length (default varies by screen size)
 * @returns Truncated string with ellipsis
 */
export function limitStringWithEllipsis(str: string, maxLength?: number): string {
  if (!maxLength) {
    // Default responsive lengths
    if (typeof window !== 'undefined') {
      maxLength = window.innerWidth < 768 ? 20 : 30;
    } else {
      maxLength = 30; // Desktop default
    }
  }

  if (str.length <= maxLength) {
    return str;
  } else {
    return str.slice(0, maxLength - 3) + "...";
  }
}

/**
 * Truncate text for mobile/desktop with full text on hover
 * @param text - Input text
 * @param type - Type of content ('name', 'email', 'description')
 * @returns Truncated text
 */
export function truncateText(text: string, type: 'name' | 'email' | 'description' | 'id' = 'description'): string {
  if (typeof window === 'undefined') return text;

  const isMobile = window.innerWidth < 768;
  
  const maxLengths = {
    mobile: { name: 15, email: 20, description: 25, id: 10 },
    desktop: { name: 25, email: 35, description: 50, id: 15 }
  };

  const maxLength = isMobile ? maxLengths.mobile[type] : maxLengths.desktop[type];
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}

export function removeFileExtension(filename: string) {
  return filename.split(".").slice(0, -1).join(".");
}

export function getFileExtension(filename: string) {
  return filename.split(".").pop();
}

export function getColorForChar(char: string): string {
  const charObj = COLOR_MAP.find((item) => item.char === char.toLowerCase());
  return charObj ? charObj.color : "bg-black";
}

export function getFirstChar(str: string): string {
  if (str.length === 0) {
    return "";
  }
  return str[0];
}

export function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function generateRandomNumbers(from: number, to: number) {
  return Math.floor(from + Math.random() * to);
}

export function calculateGST(
  price: number,
  gstRate: number,
  isInclusivePrice: boolean
) {
  let gstAmount;
  if (isInclusivePrice) {
    gstAmount = price * (gstRate / (100 + gstRate));
  } else {
    gstAmount = price * (gstRate / 100);
  }

  const totalAmount = price + gstAmount;

  return {
    gstAmount: gstAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
  };
}

export function convertString(input: string) {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
}

export function validateGSTIN(gstin: string) {
  const regex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;
  return regex.test(gstin) && gstin.length === 15;
}

/**
 * Format currency (responsive)
 * @param amount - Amount to format
 * @param currency - Currency code (default: INR)
 * @param compact - Whether to use compact notation for large numbers
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'INR', 
  compact: boolean = false
): string {
  if (compact && amount >= 100000) {
    // For large amounts on mobile, use compact notation
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    });
    return formatter.format(amount);
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Check if device is mobile
 * @returns boolean - true if mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Get responsive class based on screen size
 * @param mobileClass - Class for mobile
 * @param desktopClass - Class for desktop
 * @returns Responsive class string
 */
export function responsiveClass(mobileClass: string, desktopClass: string): string {
  return `${mobileClass} ${desktopClass}:${desktopClass}`;
}

/**
 * Format phone number (responsive)
 * @param phoneNumber - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    if (isMobileDevice()) {
      // Mobile format: XXX-XXX-XXXX
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else {
      // Desktop format: (XXX) XXX-XXXX
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
  }
  
  if (cleaned.length > 10) {
    // Handle country codes
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const number = cleaned.slice(-10);
    
    if (isMobileDevice()) {
      return `+${countryCode} ${number.replace(/(\d{5})(\d{5})/, '$1 $2')}`;
    } else {
      return `+${countryCode} ${number.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}`;
    }
  }
  
  return phoneNumber;
}

/**
 * Generate avatar initials with responsive sizing
 * @param name - Full name
 * @param size - Size in pixels (mobile size will be 20% smaller)
 * @returns Object with initials and size
 */
export function getAvatarInitials(name: string, size: number = 40): {
  initials: string;
  size: number;
  fontSize: number;
} {
  const initials = getInitials(name);
  const responsiveSize = isMobileDevice() ? Math.floor(size * 0.8) : size;
  const fontSize = Math.floor(responsiveSize * 0.4);
  
  return {
    initials,
    size: responsiveSize,
    fontSize
  };
}