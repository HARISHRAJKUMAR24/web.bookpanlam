export const dynamic = "force-dynamic";

import CategoryForm from "@/components/forms/category-form";
import { getCategory } from "@/lib/api/categories";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

type Props = {
  params: { id: string };
};

const CategoryPage = async ({ params }: Props) => {
  const { id } = params;

  const userIdCookie = cookies().get("user_id")?.value;
  const userId = userIdCookie ? Number(userIdCookie) : null;

  if (!userId) return notFound();

  /* --------------------------------------
     ADD CATEGORY
  --------------------------------------*/
  if (id === "add") {
    return (
      <>
        <h1 className="text-2xl font-bold mb-5">Add Category</h1>

        <CategoryForm
          categoryId="add"
          categoryData={null}
          isEdit={false}
          userId={userId}
        />
      </>
    );
  }

  /* --------------------------------------
     EDIT CATEGORY
  --------------------------------------*/
  const category = await getCategory(id);

  if (!category?.data) return notFound();

  /* --------------------------------------
     CATEGORY + DOCTOR DATA (FROM CATEGORY)
  --------------------------------------*/
  const finalCategoryData = {
    ...category.data,

    doctorDetails: {
      doctorName: category.data.doctorName || "",
      specialization: category.data.specialization || "",
      qualification: category.data.qualification || "",
      experience: category.data.experience || "",
      regNumber: category.data.regNumber || "",
      doctorImage: category.data.doctorImage || "",
    },
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Edit Category</h1>

      <CategoryForm
        categoryId={category.data.id} // numeric ID
        categoryData={finalCategoryData}
        isEdit={true}
        userId={userId}
      />
    </>
  );
};

export default CategoryPage;
