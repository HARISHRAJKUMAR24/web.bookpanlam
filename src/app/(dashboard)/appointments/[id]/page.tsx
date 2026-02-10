import AppointmentDetailsCards from "@/components/cards/appointment-details-cards";
import AppointmentActionForm from "@/components/forms/appointment-action-form";
import { getAppointment } from "@/lib/api/appointments";
import { notFound } from "next/navigation";

const AppointmentDetails = async ({
  params,
}: {
  params: { id: string };
}) => {
  const appointment = await getAppointment(params.id);
  
  console.log("📌 FULL Appointment API Response:", appointment);
  console.log("📌 Response structure:", JSON.stringify(appointment, null, 2));
  
  // Validate the appointment
  if (appointment === false) return notFound();

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Appointment Details</h1>

      <div className="space-y-5">
        <AppointmentDetailsCards appointment={appointment} />
        <AppointmentActionForm appointment={appointment} />
      </div>
    </>
  );
};

export default AppointmentDetails;