"use client";

import { Suspense } from "react";
import PaymentSuccessPage from "./payment-success-component";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading...
        </div>
      }
    >
      <PaymentSuccessPage />
    </Suspense>
  );
}
