"use client";
import { useState } from "react";
import CouponInformation from "./coupon-forms/coupon-information";
import Sticky from "../sticky";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { handleToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CouponFormProps } from "@/types";
import { addCoupon, updateCoupon } from "@/lib/api/coupons";
import UsageLimit from "./coupon-forms/usage-limit";
import BookingAmount from "./coupon-forms/booking-amount";
import CouponDate from "./coupon-forms/date";

const CouponForm = ({ couponId, couponData, isEdit }: CouponFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState<string>(couponData?.name || "");
  const [code, setCode] = useState<string>(couponData?.code || "");
  const [discountType, setDiscountType] = useState<string>(
    couponData?.discountType ? couponData?.discountType : "percentage"
  );
  const [discount, setDiscount] = useState<number>(couponData?.discount || 0);
  const [startDate, setStartDate] = useState<Date>(couponData?.startDate);
  const [endDate, setEndDate] = useState<Date>(couponData?.endDate);
  const [usageLimit, setUsageLimit] = useState<number | "">(couponData?.usageLimit || "");
  const [minBookingAmount, setMinBookingAmount] = useState<number | "">(couponData?.minBookingAmount || "");

  const validateForm = () => {
    // Required fields validation
    if (!name.trim()) {
      toast.error("Please enter coupon name");
      return false;
    }
    if (!code.trim()) {
      toast.error("Please enter coupon code");
      return false;
    }
    if (discount <= 0) {
      toast.error("Please enter a valid discount amount");
      return false;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return false;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      return false;
    }

    // Usage Limit validation - if provided, must be positive
    if (usageLimit !== "" && usageLimit !== null) {
      const usageLimitNum = Number(usageLimit);
      if (isNaN(usageLimitNum) || usageLimitNum < 0) {
        toast.error("Usage Limit must be a positive number or leave empty for unlimited");
        return false;
      }
    }

    // Minimum Booking Amount validation - if provided, must be positive
    if (minBookingAmount !== "" && minBookingAmount !== null) {
      const minAmountNum = Number(minBookingAmount);
      if (isNaN(minAmountNum) || minAmountNum < 0) {
        toast.error("Minimum Booking Amount must be a positive number or leave empty for no minimum");
        return false;
      }
    }

    // Date validation
// Date validation
if (startDate && endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const todayStart = new Date().setHours(0, 0, 0, 0);

  // Start date must not be in past (ONLY for new coupons)
  if (!isEdit) {
    if (start.getTime() < todayStart) {
      toast.error("Start date cannot be in the past for new coupons");
      return false;
    }
  }

  // End date must be after start date
  if (end.getTime() <= start.getTime()) {
    toast.error("End date must be after start date");
    return false;
  }
}


    return true;
  };

  const handleSave = async () => {
    // Validate form before saving
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
const data = {
  name,
  code,
  discountType,
  discount,
  startDate: startDate ? startDate : null,
  endDate: endDate ? endDate : null,
  usageLimit: usageLimit === "" ? null : Number(usageLimit),
  minBookingAmount: minBookingAmount === "" ? null : Number(minBookingAmount),
};

      const response = !isEdit
        ? await addCoupon(data)
        : await updateCoupon(couponId, data);

      handleToast(response);
      !isEdit &&
        response.success &&
        router.push(`/coupons?${Math.floor(Math.random() * 100)}`);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving the coupon");
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-7 col-span-12 grid gap-5">
          <CouponInformation
            name={{
              value: name,
              setValue: setName,
            }}
            code={{
              value: code,
              setValue: setCode,
            }}
            discountType={{
              value: discountType,
              setValue: setDiscountType,
            }}
            discount={{
              value: discount,
              setValue: setDiscount,
            }}
          />

          <CouponDate
            startDate={{
              value: startDate,
              setValue: setStartDate,
            }}
            endDate={{
              value: endDate,
              setValue: setEndDate,
            }}
          />
        </div>

        <div className="lg:col-span-5 col-span-12">
          <div className="grid gap-5">
            <UsageLimit
              usageLimit={{
                value: usageLimit,
                setValue: setUsageLimit,
              }}
            />

            <BookingAmount
              minBookingAmount={{
                value: minBookingAmount,
                setValue: setMinBookingAmount,
              }}
            />
          </div>
        </div>
      </div>

      <Sticky>
        <Button onClick={handleSave} disabled={isLoading} isLoading={isLoading}>
          Save
        </Button>
      </Sticky>
    </>
  );
};

export default CouponForm;