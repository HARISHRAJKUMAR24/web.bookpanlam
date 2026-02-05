"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Home, CreditCard, Mail } from "lucide-react";

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-full mb-6 shadow-sm">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Unsuccessful
          </h1>
          <p className="text-gray-600">
            We couldn't complete your payment at this time
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              Transaction Declined
            </span>
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">
              Don't worry - if any amount was deducted from your account, 
              it will be automatically refunded within 5-7 business days.
            </p>
            <p className="text-sm text-gray-500">
              No money has been transferred from your account
            </p>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Common Issues & Solutions
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
                <span>Bank server temporarily unavailable</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
                <span>Incorrect card details entered</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
                <span>Daily transaction limit exceeded</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              Retry Payment
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <Home className="h-5 w-5" />
              Return to Dashboard
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Our support team is here to help you
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@bookpannu.com"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                support@bookpannu.com
              </a>
              <p className="text-gray-500 text-sm">+91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Secure • Encrypted • PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}