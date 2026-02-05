"use client";

import { Warning2, Lock1 } from "iconsax-react";

interface LimitOverlayProps {
  currentCount: number;
  limitCount: number;
  excessRecords: number;
  isCustomerDetailPage?: boolean;
}

const LimitOverlay = ({
  currentCount,
  limitCount,
  excessRecords,
  isCustomerDetailPage = false
}: LimitOverlayProps) => {
  return (
    <div className="relative min-h-[50vh] sm:min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-0">
      {/* Blur Overlay Background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl"></div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-sm sm:max-w-md p-6 sm:p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 mb-4 sm:mb-6">
          {isCustomerDetailPage ? (
            <Lock1 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
          ) : (
            <Warning2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
          {isCustomerDetailPage ? "Customer Locked" : "Customer Limit Reached"}
        </h2>

        {isCustomerDetailPage ? (
          <>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              This customer is part of the newest {excessRecords} customer(s) that are
              hidden due to your current plan limits.
            </p>
            <p className="text-sm sm:text-base text-amber-700 font-medium mb-4 sm:mb-6">
              Your plan allows only {limitCount} customers.
              You currently have {currentCount} customers.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              You have reached your limit of {limitCount} customers.
              <br />
              <span className="text-red-600 font-medium text-sm sm:text-base">
                Newest {excessRecords} customer(s) are hidden.
              </span>
            </p>

            <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/50 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-amber-200 mb-4 sm:mb-6">
              <div className="text-base sm:text-lg font-semibold text-gray-800">
                {currentCount} / {limitCount}
              </div>

              <div className="w-px h-4 sm:h-6 bg-amber-300"></div>

              <div className="text-base sm:text-lg font-semibold text-red-600">
                {excessRecords} hidden
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">

          {/* Upgrade Button */}
          <a
            href="/all-plans"
            className="
      w-full
      px-6 py-3.5
      bg-gradient-to-r from-primary to-primary/90
      text-white font-semibold
      rounded-xl
      text-sm sm:text-base
      text-center
      transition-all duration-300
      hover:from-primary/90 hover:to-primary
      hover:scale-[1.02]
      shadow-md hover:shadow-lg
    "
          >
            Upgrade Plan to View All Customers
          </a>

          {/* Back Button */}
          <a
            href="/customers"
            className="
      w-full
      px-6 py-3
      bg-gray-100
      text-gray-700 font-medium
      rounded-xl
      text-sm sm:text-base
      text-center
      transition-all duration-300
      hover:bg-gray-200
      hover:scale-[1.02]
    "
          >
            Back to Customers List
          </a>

        </div>

      </div>
    </div>
  );
};

export default LimitOverlay;