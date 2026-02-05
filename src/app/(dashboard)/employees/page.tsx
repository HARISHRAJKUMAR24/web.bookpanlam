import EmployeesFilter from "@/components/filters/employees-filter";
import { DataTable } from "@/components/tables/employees-table/data-table";
import { columns } from "@/components/tables/employees-table/columns";
import { employeeParams } from "@/types";
import { Button } from "@/components/ui/button";
import { Add } from "iconsax-react";
import { getAllEmployees } from "@/lib/api/employees";
import Link from "next/link";

const Employees = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: employeeParams;
}) => {
  const data = await getAllEmployees({
    limit,
    page,
    q,
  });
  console.log("EMPLOYEES DATA ===> ", data);

  return (
    <>
      <div className="flex items-center justify-between gap-5 mb-5">
        <h1 className="text-2xl font-bold">Employees</h1>

        <Link href="/employees/add">
          <Button variant="success">
            <span className="mobile_l:block hidden">Add Employee</span>
            <span className="mobile_l:hidden block">
              <Add />
            </span>
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <EmployeesFilter data={data.records} />
        <DataTable columns={columns} data={data} />

      </div>
    </>
  );
};

export default Employees;
