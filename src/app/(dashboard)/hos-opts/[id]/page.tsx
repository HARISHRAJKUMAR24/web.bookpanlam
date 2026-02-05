import Doctor_Schedule from "@/components/forms/doctor-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { id: string };
}

const DoctorSchedulePage = async ({ params: { id } }: PageProps) => {
  let serviceData = null;

  // 🟢 EDIT MODE
  if (id !== "add") {
    const res = await fetch(
      `http://localhost/manager.bookpanlam/public/seller/doctor_schedule/get.php?id=${id}`,
      {
        credentials: "include", // ✅ cookie token
        cache: "no-store",
      }
    );

    const json = await res.json();

    if (!json?.success) {
      return notFound();
    }

    serviceData = json.data;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">
        {id === "add" ? "Add" : "Edit"} Doctor Schedule
      </h1>

      <Doctor_Schedule
        serviceId={id}
        serviceData={serviceData}
        isEdit={id !== "add"}
      />
    </>
  );
};

export default DoctorSchedulePage;
