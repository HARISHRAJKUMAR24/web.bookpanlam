// app/purchase-history/page.tsx
export const dynamic = "force-dynamic";
import PurchaseHistoryCard from "@/components/cards/purchase-history-card";
import { getAllPurchaseHistory } from "@/lib/api/purchase-history";
import { PurchaseHistory } from "@/types";
import Link from "next/link";
import { Receipt } from "lucide-react";

const PurchaseHistoryPage = async () => {
  const response = await getAllPurchaseHistory();
  
  console.log("📌 Full Purchase History Response:", JSON.stringify(response, null, 2));

  // Handle different response formats
  let purchaseHistory: PurchaseHistory[] = [];
  
  if (response?.success && Array.isArray(response.data)) {
    purchaseHistory = response.data;
  } else if (Array.isArray(response)) {
    purchaseHistory = response;
  } else if (response?.data && Array.isArray(response.data)) {
    purchaseHistory = response.data;
  }

  console.log("📌 Processed Purchase History:", purchaseHistory);
  console.log("📌 Number of records:", purchaseHistory.length);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-600 mt-1">View and download all your past invoices</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          Total Purchases: {purchaseHistory.length}
        </div>
      </div>

      {purchaseHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Receipt className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchase history</h3>
          <p className="text-gray-600 mb-6">You haven't made any purchases yet.</p>
          <Link 
            href="/plans"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryPage;