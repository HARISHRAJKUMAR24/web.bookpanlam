"use client";

import { Suspense } from "react";
import SSOContent from "./sso-content";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SSOContent />
    </Suspense>
  );
}
