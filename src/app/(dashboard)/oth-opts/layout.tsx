import { redirect } from "next/navigation";
import { currentUser } from "@/lib/api/users";

export default async function OthOptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/login");

  // OTHER = 3
  if (user.service_type_id !== 3) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
