"use client";

import { exportToExcel } from "@/lib/utils";
import { Employee } from "@/types";
import { Export as ExportIcon } from "iconsax-react";

const Export = ({ data }: { data: Employee[] | undefined | null }) => {
  // Always ensure data is an array
  const safeData: Employee[] = Array.isArray(data) ? data : [];

  // Remove unwanted keys before export
  const updatedData = safeData.map((person) => {
const { id, user_id, employee_id, image, ...rest } = person;
    return rest;
  });

  const handleExport = () => {
    if (updatedData.length === 0) {
      alert("No data available to export");
      return;
    }

    const date = new Date();
    const fileName = `employees_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

    exportToExcel(updatedData, fileName);
  };

  return (
    <button
      className="bg-primary text-white rounded-full h-12 px-5 flex items-center justify-center gap-2 w-full sm:w-auto transition hover:bg-primary/90"
      onClick={handleExport}
    >
      <ExportIcon />
      Export
    </button>
  );
};

export default Export;
