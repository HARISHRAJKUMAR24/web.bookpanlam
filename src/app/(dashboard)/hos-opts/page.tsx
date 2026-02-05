import { DataTable } from "@/components/tables/doctor-table/data-table";
import { columns } from "@/components/tables/doctor-table/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Add } from "iconsax-react";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DoctorAppointmentPage() {
  const cookieStore = cookies();

  const response = await fetch(
    "http://localhost/manager.bookpanlam/public/seller/doctor_schedule/list.php",
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    }
  ).then((res) => res.json());

  console.log("DOCTOR API RESPONSE =>", response);

  const tableData = {
    records: response?.records ?? [],
    totalRecords: response?.totalRecords ?? 0,
    totalPages: response?.totalPages ?? 1,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Doctor Appointment</h1>

        <Link href="/hos-opts/add">
          <Button variant="success">
            Add Appointment <Add className="ml-2" />
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={tableData} />
    </>
  );
}
