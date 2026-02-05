import { getAllAppointments, getReports } from "@/lib/api/appointments";
import { convertString } from "@/lib/utils";
import { appointmentsParams } from "@/types";

import { DateFilter } from "@/components/filters/reports/date-filter";
import OverviewCard from "@/components/cards/reports/overview-card";

import AppointmentFilters from "@/components/filters/appointments-filter";
import { DataTable } from "@/components/tables/appointments-table/data-table";
import { columns } from "@/components/tables/appointments-table/columns";

type searchParams = appointmentsParams & {
  date: string;
};

const Reports = async ({
  searchParams: {
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
    date,
  },
}: {
  searchParams: searchParams;
}) => {
  const reports = await getReports(date);
  const appointments = await getAllAppointments({
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
  });

  return (
    <div className="grid gap-5">
      <div className="flex mobile_l:items-center justify-between flex-col mobile_l:flex-row gap-5">
        <h1 className="text-2xl font-bold">Reports</h1>

        <DateFilter />
      </div>

      <div className="grid grid-cols-1 mobile_l:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {Object.keys(reports).map((i, index: number) => (
          <OverviewCard
            key={index}
            index={index}
            label={convertString(i)
              .replace("Amount", "Earnings")
              .replace("Gst Earnings", "GST Amount")}
            number={reports[i]}
          />
        ))}
      </div>

      <div className="space-y-5 mt-10">
        <AppointmentFilters data={appointments.records} />
        <DataTable columns={columns} data={appointments} />
      </div>
    </div>
  );
};

export default Reports;
