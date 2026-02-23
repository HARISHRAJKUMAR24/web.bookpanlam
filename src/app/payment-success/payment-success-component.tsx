"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, Home } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getPaymentDetails, type PaymentDetails } from "@/lib/api/get-payment-details";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const invoiceNumber = searchParams.get("invoice");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceNumber) {
      fetchPaymentDetails(invoiceNumber);
    } else {
      setLoading(false);
    }
  }, [invoiceNumber]);

  const fetchPaymentDetails = async (invoice: string) => {
    try {
      const result = await getPaymentDetails(invoice);

      if (result.success && result.data) {
        // Just verify payment was successful, no need to store details
        setLoading(false);
      } else {
        toast.error(result.message || "Failed to fetch payment details");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast.error("Error fetching payment details");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your subscription. Your payment has been processed successfully.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">What happens next?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-2">Account Activation</h4>
              <p className="text-blue-800 text-sm">
                Your subscription will be activated within 5 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-2">Email Confirmation</h4>
              <p className="text-blue-800 text-sm">
                You'll receive a confirmation email with all details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-blue-900 mb-2">Start Using</h4>
              <p className="text-blue-800 text-sm">
                Log in to your dashboard to access all features
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
          >
            <Home size={20} className="mr-2" />
            Go to Dashboard
          </Link>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
          >
            View Other Plans
          </Link>
        </div>
      </div>
    </div>
  );
}