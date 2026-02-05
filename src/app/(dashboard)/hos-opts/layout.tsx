import { redirect } from "next/navigation";
import { currentUser } from "@/lib/api/users";

export default async function HosOptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/login");

  // HOSPITAL = 1
  if (user.service_type_id !== 1) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
