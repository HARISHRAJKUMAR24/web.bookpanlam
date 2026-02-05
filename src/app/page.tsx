import { currentUser } from "@/lib/api/users";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (user) {
return redirect("/dashboard");

  }

  return redirect("/login");
}
