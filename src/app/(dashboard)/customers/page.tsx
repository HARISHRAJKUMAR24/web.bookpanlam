import CustomersFilter from "@/components/filters/customers-filter";
import { DataTable } from "@/components/tables/customers-table/data-table";
import { columns } from "@/components/tables/customers-table/columns";
import { customerParams } from "@/types";
import { getAllCustomers, checkCustomerLimit } from "@/lib/api/customers";
import LimitAlert from "@/components/ui/limit-alert";

const Customers = async ({
  searchParams: { limit, page, q },
}: {
  searchParams: customerParams;
}) => {
  const data = await getAllCustomers({
    limit,
    page,
    q,
  });

  const limitData = await checkCustomerLimit();

  const currentCount = data.totalRecords || 0;
  const limitCount =
    limitData.limit === "unlimited" ? Infinity : limitData.limit || 0;

  const isLimitReached =
    currentCount > limitCount && limitCount !== Infinity;

  const excessRecords =
    isLimitReached && limitCount > 0 && limitCount !== Infinity
      ? Math.max(0, currentCount - limitCount)
      : 0;

  let visibleCustomers = data.records;
  if (isLimitReached && limitCount > 0 && limitCount !== Infinity) {
    visibleCustomers = [...data.records]
      .reverse()
      .slice(0, limitCount)
      .reverse();
  }

  if (!data || !Array.isArray(data.records)) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-5">Customers</h1>
        <div className="text-red-600 font-semibold">
          Customers data could not be loaded.
        </div>
      </div>
    );
  }

  const isSearching = q && q.trim().length > 0;

  const searchedVisible = isSearching
    ? visibleCustomers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.phone.toLowerCase().includes(q.toLowerCase())
      );
    })
    : visibleCustomers;


  const tableRecords = isSearching ? searchedVisible : data.records;

  const tableBlur = !isSearching && isLimitReached;

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Customers</h1>

      {/* Show limit alert only when not searching */}
      {isLimitReached && !isSearching && (
        <LimitAlert
          limitData={limitData}
          currentCount={currentCount}
          limitCount={limitCount}
          excessRecords={excessRecords}
        />
      )}

      <div className="space-y-5">
        <CustomersFilter
          data={visibleCustomers}
          isLimitReached={tableBlur}
          excessRecords={excessRecords}
        />

        <DataTable
          columns={columns}
          data={{
            records: tableRecords,
            totalPages: data.totalPages,
            totalRecords: data.totalRecords,
          }}
          isLimitReached={tableBlur}
          currentCount={currentCount}
          limitCount={limitCount}
          excessRecords={excessRecords}
        />
      </div>
    </>
  );
};

export default Customers;
