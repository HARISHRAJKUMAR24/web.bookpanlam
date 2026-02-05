"use client";

import { Warning2 } from "iconsax-react";

interface LimitAlertProps {
  limitData: {
    can_add: boolean;
    message: string;
    current: number;
    limit: number | string;
    remaining: number;
    plan_expired: boolean;
    expiry_message: string;
  };
  currentCount: number;
  limitCount: number;
  excessRecords: number;
}

const LimitAlert = ({ 
  limitData, 
  currentCount, 
  limitCount, 
  excessRecords 
}: LimitAlertProps) => {
  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg sm:rounded-xl">
      <div className="text-center">
        {/* Icon and Title */}
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 mb-2 sm:mb-3">
          <Warning2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
        </div>
        
        <h3 className="font-semibold text-amber-900 text-base sm:text-lg mb-1">
          Customer Limit Reached
        </h3>
        
        {/* Main Message */}
        {limitData.plan_expired ? (
          <p 
            className="text-amber-800 text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: limitData.expiry_message || "Your plan has expired. Please renew to continue using all features." }}
          />
        ) : (
          <p className="text-amber-800 text-sm sm:text-base">
            You have reached your limit ({limitCount} customers).
            <br />
            <span className="font-medium">
              Newest {excessRecords} customer(s) are hidden.
            </span>
          </p>
        )}
        
        {/* Stats - Clean inline display */}
        <div className="mt-2 sm:mt-3 inline-flex items-center gap-2 sm:gap-3 bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-amber-200">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700">
              {currentCount} / {limitCount}
            </div>
          </div>
          
          <div className="w-px h-3 sm:h-4 bg-amber-300"></div>
          
          {excessRecords > 0 && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-xs sm:text-sm font-medium text-red-600">
                {excessRecords} hidden
              </div>
            </div>
          )}
        </div>
        
        {/* Upgrade Button - Centered */}
        <div className="mt-3 sm:mt-4">
          <a 
            href="/plans" 
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-medium rounded-md sm:rounded-lg hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow text-sm sm:text-base w-full sm:w-auto"
          >
            Upgrade Plan to View All Customers
          </a>
        </div>
      </div>
    </div>
  );
};

export default LimitAlert;