"use client";
import { exportToExcel } from "@/lib/utils";
import { Customer } from "@/types";
import { Export as ExportIcon } from "iconsax-react";

const Export = ({ 
  data, 
  disabled = false,
  isLimitReached = false,
  excessRecords = 0
}: { 
  data: Customer[];  // This now contains ONLY visible customers
  disabled?: boolean;
  isLimitReached?: boolean;
  excessRecords?: number;
}) => {
  const handleExport = () => {
    if (disabled || !data || data.length === 0) return;
    
    // Prepare data for export
    const exportData = data.map((person) => {
      const { id, user, userId, password, photo, countData, ...rest } = person;
      return {
        ...rest,
      };
    });

    // Add info row if some customers were excluded
    let finalData = [...exportData];
    if (isLimitReached && excessRecords > 0) {
const infoRow = {
  customerId: 0, // must be number
  name: `ℹ️ Only ${data.length} of ${data.length + excessRecords} customers exported`,
  phone: `${excessRecords} newest customers require plan upgrade`,
  email: "",
  createdAt: "",
  totalSpent: "",
  appointments: ""
};

      finalData = [infoRow, ...finalData];
    }

    const date = new Date();
    const fileName = `customers_${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;
    
    exportToExcel(finalData, fileName);
  };

  return (
    <button
      className={`
        text-white rounded-full h-12 px-5 flex items-center justify-center gap-2 w-full sm:w-auto transition relative
        ${disabled 
          ? "bg-gray-400 cursor-not-allowed" 
          : "bg-primary hover:bg-primary/90 cursor-pointer"
        }
      `}
      onClick={handleExport}
      disabled={disabled}
      title={
        isLimitReached && excessRecords > 0
          ? `Export ${data.length} visible customers (${excessRecords} hidden)`
          : `Export all ${data.length} customers`
      }
    >
      <ExportIcon />
      Export
      {isLimitReached && excessRecords > 0 && (
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">
          {data.length} of {data.length + excessRecords}
        </span>
      )}
    </button>
  );
};

export default Export;