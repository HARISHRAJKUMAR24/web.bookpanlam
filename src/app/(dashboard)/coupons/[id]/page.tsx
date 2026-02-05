import CouponForm from "@/components/forms/coupon-form";
import { getCoupon } from "@/lib/api/coupons";
import { notFound } from "next/navigation";

const Coupon = async ({ params: { id } }: { params: { id: string } }) => {
  let coupon = null;
  if (id !== "add") coupon = await getCoupon(id);

  // Validate the coupon
  if (coupon === false) return notFound();
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">
        {id === "add" ? "Add" : "Edit"} Coupon
      </h1>

      <CouponForm couponId={id} couponData={coupon} isEdit={coupon && true} />
    </>
  );
};

export default Coupon;
