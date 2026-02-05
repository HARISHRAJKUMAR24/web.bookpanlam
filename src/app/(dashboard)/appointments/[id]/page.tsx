import AppointmentDetailsCards from "@/components/cards/appointment-details-cards";
import AppointmentActionForm from "@/components/forms/appointment-action-form";
import { getAppointment } from "@/lib/api/appointments";
import { notFound } from "next/navigation";

const AppointmentDetails = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const appointment = await getAppointment(id);
  // Validate the appointment
  if (appointment === false) return notFound();

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Appointment Details</h1>

      <div className="space-y-5">
        <AppointmentActionForm appointment={appointment} />
        <AppointmentDetailsCards appointment={appointment} />
      </div>
    </>
  );
};

export default AppointmentDetails;
