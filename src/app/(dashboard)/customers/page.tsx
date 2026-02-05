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
  // Get customers data (already sorted by created_at DESC from API - newest first)
  const data = await getAllCustomers({
    limit,
    page,
    q,
  });

  // Check customer limit
  const limitData = await checkCustomerLimit();

  // Get limit numbers
  const currentCount = data.totalRecords || 0;
  const limitCount = limitData.limit === 'unlimited' ? Infinity : (limitData.limit || 0);

  // Check if limit is reached (current count > limit count)
  const isLimitReached = currentCount > limitCount && limitCount !== Infinity;

  // Calculate how many newest customers are hidden
  const excessRecords = isLimitReached && limitCount > 0 && limitCount !== Infinity
    ? Math.max(0, currentCount - limitCount)
    : 0;

  // Determine which customers are VISIBLE (not hidden)
  let visibleCustomers = data.records;
  if (isLimitReached && limitCount > 0 && limitCount !== Infinity) {
    // Since API returns newest first, visible customers are the OLDEST ones
    // We need to take the last `limitCount` records
    visibleCustomers = [...data.records].reverse().slice(0, limitCount).reverse();
  }

  // 🛑 HARD SAFETY GUARD (NO SILENT FAILURES)
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

  return (
    <>
      <h1 className="text-2xl font-bold mb-5">Customers</h1>

      {/* Show limit alert ONLY when limit is reached */}
      {isLimitReached && (
        <LimitAlert
          limitData={limitData}
          currentCount={currentCount}
          limitCount={limitCount}
          excessRecords={excessRecords}
        />
      )}

      <div className="space-y-5">
        {/* Pass ONLY visible customers to the filter */}
        <CustomersFilter
          data={visibleCustomers}  // ⬅️ ONLY VISIBLE CUSTOMERS
          isLimitReached={isLimitReached}
          excessRecords={excessRecords}
        />

        {/* DataTable with all records - will apply blur effect internally */}
        <DataTable
          columns={columns}
          data={{
            records: data.records,  // ⬅️ ALL CUSTOMERS for display with blur
            totalPages: data.totalPages,
            totalRecords: data.totalRecords,
          }}
          isLimitReached={isLimitReached}
          currentCount={currentCount}
          limitCount={limitCount}
          excessRecords={excessRecords}
        />
      </div>
    </>
  );
};

export default Customers;