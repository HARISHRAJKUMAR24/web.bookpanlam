import { redirect } from "next/navigation";
import { currentUser } from "@/lib/api/users";
import HotelForm from "@/components/forms/hotel-form";

export default async function HotOptsPage() {
  const user = await currentUser();

  if (!user) redirect("/login");

  if (user.service_type_id !== 2) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Hotel Menu Options
      </h1>

      <HotelForm />
    </div>
  );
}
