"use client";
import { exportToExcel } from "@/lib/utils";
import { Appointment } from "@/types";
import { Export as ExportIcon } from "iconsax-react";

const Export = ({ data }: { data: Appointment[] }) => {
  const updatedData = data?.map((person) => {
    const {
      id,
      userId,
      customerId,
      serviceId,
      employeeId,
      employee,
      service,
      customer,
      user,
      ...rest
    } = person;
    return {
      ...rest,
      employee: employee?.name + " - " + employee?.phone,
      service: service?.name,
    };
  });

  const handleExport = () => {
    const date = new Date();
    exportToExcel(
      updatedData,
      `appointments_${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`
    );
  };

  return (
    <button
      className="bg-primary text-white rounded-full h-12 px-4 sm:px-5 flex items-center justify-center gap-2 w-full sm:w-auto transition hover:bg-primary/90 text-sm sm:text-base"
      onClick={handleExport}
    >
      <ExportIcon size="20" className="shrink-0" />
      <span className="truncate">Export</span>
    </button>
  );
};

export default Export;