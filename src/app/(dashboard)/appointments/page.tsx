import AppointmentFilters from "@/components/filters/appointments-filter";
import { DataTable } from "@/components/tables/appointments-table/data-table";
import { columns } from "@/components/tables/appointments-table/columns";
import { appointmentsParams } from "@/types";
import { getAllAppointments } from "@/lib/api/appointments";

const Appointments = async ({
  searchParams: {
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
  },
}: {
  searchParams: appointmentsParams;
}) => {
const data = await getAllAppointments({
  limit,
  page,
  q,
  status,
  paymentStatus,
  paymentMethod,
  fromDate,
  toDate,
});

console.log("📌 Appointments API Response:", data);


  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Appointments</h1>

      <div className="space-y-5">
        <AppointmentFilters data={data.records} />
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};

export default Appointments;
