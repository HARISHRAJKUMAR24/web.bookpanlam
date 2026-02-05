import CustomerCard from "@/components/cards/customer-detail/customer-card";
import AppointmentFilters from "@/components/filters/appointments-filter";
import { columns } from "@/components/tables/appointments-table/columns";
import { DataTable } from "@/components/tables/appointments-table/data-table";
import LimitOverlay from "@/components/ui/limit-overlay";

import { getAllAppointments } from "@/lib/api/appointments";
import { getCustomer, checkCustomerLimit, getAllCustomers } from "@/lib/api/customers";
import { appointmentsParams } from "@/types";
import { notFound } from "next/navigation";

const CustomerPage = async ({
  params: { id },
  searchParams: {
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    fromDate,
    toDate,
  },
}: {
  params: { id: string };
  searchParams: appointmentsParams;
}) => {

  // ===========================================
  // 1️⃣ FETCH ONLY THIS CUSTOMER
  // ===========================================
  const customer = await getCustomer(Number(id));

  if (!customer) {
    return notFound();
  }

  // ===========================================
  // 2️⃣ CHECK LIMIT FOR CUSTOMER ACCESS
  // ===========================================
  const limitData = await checkCustomerLimit();
  const allData = await getAllCustomers({ limit: 999999, page: 1, q: "" });

  const currentCount = allData.totalRecords;
  const limitCount =
    limitData.limit === "unlimited" ? Infinity : (limitData.limit || 0);

  const isLimitReached = currentCount > limitCount && limitCount !== Infinity;

  // Determine if this specific customer is within allowed range
  let isCustomerAccessible = true;

  if (isLimitReached && limitCount > 0 && limitCount !== Infinity) {
    const reversed = [...allData.records].reverse(); // oldest first
    const allowedCustomers = reversed.slice(0, limitCount);

    isCustomerAccessible = allowedCustomers.some(
      (c) => c.customerId === Number(id)
    );
  }

  // If customer is locked → show overlay
  if (!isCustomerAccessible) {
    return (
      <div className="p-5 min-h-[70vh] relative">
        <LimitOverlay
          currentCount={currentCount}
          limitCount={limitCount}
          excessRecords={Math.max(0, currentCount - limitCount)}
          isCustomerDetailPage={true}
        />
      </div>
    );
  }

  // ===========================================
  // 3️⃣ LOAD APPOINTMENTS FOR THIS CUSTOMER ONLY
  // ===========================================
  const appointments = await getAllAppointments({
    limit,
    page,
    q,
    status,
    paymentStatus,
    paymentMethod,
    customerId: customer.customerId, // FINAL FIX
    fromDate,
    toDate,
  });

  // ===========================================
  // 4️⃣ RENDER THE SAME UI YOU ALREADY HAVE
  // ===========================================
  return (
    <div className="grid grid-cols-12 gap-5">
      {/* LEFT: CUSTOMER INFO */}
      <div className="col-span-12 lg:col-span-5 3xl:col-span-4 4xl:col-span-3">
        <CustomerCard customer={customer} />
      </div>

      {/* RIGHT: CUSTOMER APPOINTMENTS */}
      <div className="col-span-12 lg:col-span-7 3xl:col-span-8 4xl:col-span-9">
        <div className="space-y-5">
          <AppointmentFilters data={appointments.records} />
          <DataTable columns={columns} data={appointments} />
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
