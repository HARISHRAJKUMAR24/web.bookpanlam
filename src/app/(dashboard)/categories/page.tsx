import CategoriesFilter from "@/components/filters/categories-filter";
import { DataTable } from "@/components/tables/categories-table/data-table";
import { columns } from "@/components/tables/categories-table/columns";
import { getAllCategories } from "@/lib/api/categories";
import { categoriesParams } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Categories = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: categoriesParams;
}) => {
  
  const data = await getAllCategories({
    limit,
    page,
    q,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-5 mb-5">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/categories/add">
          <Button variant="success">
            Add Category
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <CategoriesFilter />

        <DataTable
          columns={columns}
          data={{
            records: data.records ?? [],
            totalPages: data.totalPages ?? 1,
            totalRecords: data.totalRecords ?? 0,
          }}
        />
      </div>
    </>
  );
};

export default Categories;
