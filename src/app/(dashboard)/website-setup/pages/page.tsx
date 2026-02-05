import PagesFilter from "@/components/filters/pages-filter";
import { columns } from "@/components/tables/pages-table/columns";
import { DataTable } from "@/components/tables/pages-table/data-table";
import { Button } from "@/components/ui/button";
import { getAllPages } from "@/lib/api/website-pages";
import { pagesParams } from "@/types";
import { Add } from "iconsax-react";
import Link from "next/link";

const Pages = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: pagesParams;
}) => {
  const data = await getAllPages({
    limit,
    page,
    q,
  });

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Pages</h3>
        <p className="text-black/50 text-sm font-medium">
          Create and customize the pages.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-5">
          <PagesFilter />

          <Link href="/website-setup/pages/add">
            <Button variant="success">
              <span className="mobile_l:block hidden">Add Page</span>
              <span className="mobile_l:hidden block">
                <Add />
              </span>
            </Button>
          </Link>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Pages;
