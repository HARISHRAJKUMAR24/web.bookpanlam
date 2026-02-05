import DepartmentsFilter from "@/components/filters/department-filter";
import { DataTable } from "@/components/tables/department-tabel/data-table";
import { columns } from "@/components/tables/department-tabel/columns";
import { getAllDepartments } from "@/lib/api/departments";
import { departmentsParams } from "@/types";
import { Add } from "iconsax-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Departments = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: departmentsParams;
}) => {
  const data = await getAllDepartments({
    limit,
    page,
    q,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-5 mb-5">
        <h1 className="text-2xl font-bold">Departments</h1>

        {/* ✅ NO SLUG */}
        <Link href="/departments/add">
          <Button variant="success">
            <span className="mobile_l:block hidden">Add Department</span>
            <span className="mobile_l:hidden block">
              <Add />
            </span>
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <DepartmentsFilter />
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};

export default Departments;