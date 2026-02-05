import CouponsFilter from "@/components/filters/coupons-filter";
import { DataTable } from "@/components/tables/coupons-table/data-table";
import { columns } from "@/components/tables/coupons-table/columns";
import { couponsParams } from "@/types";
import { Add } from "iconsax-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllCoupons } from "@/lib/api/coupons";

const Coupons = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: couponsParams;
}) => {
  const data = await getAllCoupons({
    limit,
    page,
    q,
  });

  return (
    <>
      <div className="flex items-center justify-between gap-5 mb-5">
        <h1 className="text-2xl font-bold">Coupons</h1>

        <Link href="/coupons/add">
          <Button variant="success">
            <span className="mobile_l:block hidden">Add Coupon</span>
            <span className="mobile_l:hidden block">
              <Add />
            </span>
          </Button>
        </Link>
      </div>

      <div className="space-y-5">
        <CouponsFilter />
        <DataTable columns={columns} data={data} />
      </div>
    </>
  );
};

export default Coupons;
