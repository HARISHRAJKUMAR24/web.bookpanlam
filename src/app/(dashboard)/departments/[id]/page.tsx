export const dynamic = "force-dynamic"; // ✅ IMPORTANT FIX

import DepartmentForm from "@/components/forms/department-form";
import { getDepartment } from "@/lib/api/departments";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

type Props = {
  params: {
    id: string;
  };
};

const DepartmentPage = async ({ params }: Props) => {
  const { id } = params;

  // ✅ GET USER ID FROM COOKIE
  const userId = cookies().get("user_id")?.value || "";

  if (!userId) {
    // If user is not logged in
    return notFound();
  }

  // ===============================
  // ADD DEPARTMENT
  // ===============================
  if (id === "add") {
    return (
      <>
        <h1 className="text-2xl font-bold mb-5">Add Department</h1>

        <DepartmentForm
          departmentId="add"
          departmentData={null}
          isEdit={false}
          userId={userId}
        />
      </>
    );
  }

  // ===============================
  // EDIT DEPARTMENT
  // ===============================
  const department = await getDepartment(id);

  if (!department?.data) {
    return notFound();
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Edit Department</h1>

      <DepartmentForm
        departmentId={id}
        departmentData={department.data}
        isEdit={true}
        userId={userId}
      />
    </>
  );
};

export default DepartmentPage;