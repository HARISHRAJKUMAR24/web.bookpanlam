import { redirect } from "next/navigation";
import { currentUser } from "@/lib/api/users";

export default async function HotOptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/login");

  // HOTEL = 2
  if (user.service_type_id !== 2) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
