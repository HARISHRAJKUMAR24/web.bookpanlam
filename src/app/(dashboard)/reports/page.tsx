import { getAllAppointments, getReports } from "@/lib/api/appointments";
import { convertString } from "@/lib/utils";
import { appointmentsParams } from "@/types";

import { DoctorFilter } from "@/components/filters/reports/doctor-filter";
import OverviewCard from "@/components/cards/reports/overview-card";

import AppointmentFilters from "@/components/filters/appointments-filter";

type SearchParams = appointmentsParams & {
  doctor?: string;
};

const Reports = async ({ searchParams }: { searchParams: SearchParams }) => {
  const {
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
    doctor,
  } = searchParams;

  const selectedDoctor = doctor || "all";

  /* ------------------------------------
     1️⃣ Fetch ALL appointments (no doctor filter)
  ------------------------------------- */
  const allAppointments =
    (await getAllAppointments({
      limit: 1000, // large enough
      page: 1,
    })) || { records: [] };

  /* ------------------------------------
     2️⃣ Extract ALL doctors (stable list)
  ------------------------------------- */
const doctors: string[] = Array.from(
  new Set(
    (allAppointments.records || [])
      .map((item: any): string | null => {
        try {
          if (item.service_name?.startsWith("{")) {
            const parsed = JSON.parse(item.service_name);
            return parsed.doctor_name ?? null;
          }
          return typeof item.service_name === "string"
            ? item.service_name
            : null;
        } catch {
          return null;
        }
      })
.filter((name: string | null): name is string => Boolean(name))
  )
);

  /* ------------------------------------
     3️⃣ Fetch FILTERED appointments
  ------------------------------------- */
  const appointments =
    (await getAllAppointments({
      limit,
      page,
      q,
      status,
      paymentStatus,
      paymentMethod,
      fromDate,
      toDate,
      doctor: selectedDoctor,
    })) || { records: [], totalPages: 1 };

  /* ------------------------------------
     4️⃣ Fetch FILTERED reports
  ------------------------------------- */
const reports =
  (await getReports({
    doctor: selectedDoctor,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
  })) || {};

  return (
    <div className="grid gap-5">
      <div className="flex mobile_l:items-center justify-between flex-col mobile_l:flex-row gap-5">
        <h1 className="text-2xl font-bold">Reports</h1>
        <DoctorFilter doctors={doctors} />
      </div>

      <div className="grid grid-cols-1 mobile_l:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {Object.entries(reports)
          .map(([key, value]: any, index: number) => (
            <OverviewCard
              key={index}
              index={index}
              label={convertString(key)
                .replace("Amount", "Earnings")
                .replace("Gst Earnings", "GST Amount")}
              number={value}
            />
          ))}
      </div>

    </div>
  );
};


export default Reports;
