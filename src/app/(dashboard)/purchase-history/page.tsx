// app/purchase-history/page.tsx
export const dynamic = "force-dynamic";
import PurchaseHistoryCard from "@/components/cards/purchase-history-card";
import { getAllPurchaseHistory } from "@/lib/api/purchase-history";
import { PurchaseHistory } from "@/types";
import Link from "next/link";
import { Receipt, CreditCard, AlertCircle, ArrowRight } from "lucide-react";

export default async function PurchaseHistoryPage() {
  const response = await getAllPurchaseHistory();

  console.log("📌 Full Purchase History Response:", JSON.stringify(response, null, 2));

  let purchaseHistory: PurchaseHistory[] = [];
  let hasSubscription = false;
  let hasCustomerPayments = false;

  if (response?.success) {
    if (Array.isArray(response.data)) {
      purchaseHistory = response.data;
    }
    hasSubscription = response.has_subscription || false;
    hasCustomerPayments = response.has_customer_payments || false;
  }

  // CASE 1: No subscription at all - Show "Purchase Plan" message
  if (!hasSubscription && purchaseHistory.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mb-4 sm:mb-6">
              <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              Purchase History
            </h1>
            
            <div className="max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No subscription found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
                You haven't purchased any subscription plan yet. 
                Choose a plan to start accepting payments from customers.
              </p>
              
              <Link
                href="/all-plans"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                Purchase a Plan
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Has subscription but NO customer payments - Show empty state with info
  if (hasSubscription && !hasCustomerPayments && purchaseHistory.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] p-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Purchase History
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Track your subscription invoices and payment history
              </p>
            </div>
          </div>

          {/* Info Alert - Centered and Responsive */}
          <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 bg-amber-100 rounded-full">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-800 mb-1">
                    Subscription active
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700">
                    Your subscription invoices will appear here once you receive your first customer payment. 
                    Start accepting payments to see your transaction history.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12 sm:py-16 px-4 sm:px-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full mb-4 sm:mb-6">
              <Receipt className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No invoices to display
            </h3>
            
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-2">
              Your subscription is active. Once customers make payments, 
              their invoices will appear here automatically.
            </p>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASE 3: Has subscription AND has customer payments - Show invoices
  if (purchaseHistory.length > 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Purchase History
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                View and download all your past invoices
              </p>
            </div>
            
            {/* Stats Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-blue-100">
                <span className="text-xs sm:text-sm font-medium text-blue-700">
                  Total Purchases: <span className="font-bold text-blue-800">{purchaseHistory.length}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Cards Grid - Fully Responsive */}
          {purchaseHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {purchaseHistory.map((purchase: PurchaseHistory) => (
                <PurchaseHistoryCard
                  key={purchase.id}
                  id={purchase.id}
                  invoice_number={purchase.invoice_number}
                  plan_name={purchase.plan_name || 'Subscription Plan'}
                  amount={purchase.amount}
                  currency_symbol={purchase.currency_symbol || '₹'}
                  payment_method={purchase.payment_method}
                  payment_id={purchase.payment_id}
                  created_at={purchase.created_at}
                  status="Paid"
                  customer_name={purchase.name}
                  customer_email={purchase.email}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">Your purchase history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback - Should never reach here
  return null;
}