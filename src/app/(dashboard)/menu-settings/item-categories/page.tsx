import { redirect } from "next/navigation";
import { currentUser } from "@/lib/api/users";
import ItemCategoriesClient from "@/components/forms/menu-settings/item-categories/category-table";

export default async function ItemCategoriesPage() {
  const user = await currentUser();

  if (!user) redirect("/login");

  // HOTEL only
  if (user.service_type_id !== 2) {
    redirect("/dashboard");
  }

  return <ItemCategoriesClient />;
}
