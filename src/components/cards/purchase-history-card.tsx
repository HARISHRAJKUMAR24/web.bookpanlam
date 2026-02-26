"use client";

import { useState } from "react";
import { Calendar, Download, Eye, IndianRupee, Receipt, CreditCard, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { downloadInvoicePDF } from "@/lib/api/get-payment-details";

interface PurchaseHistoryCardProps {
  id: number;
  invoice_number: string;
  plan_name: string;
  amount: number;
  currency_symbol: string;
  payment_method: string;
  payment_id: string;
  created_at: string;
  status?: string;
  customer_name: string;
  customer_email: string;
  purchase_type?: string;
}

const PurchaseHistoryCard = ({
  id,
  invoice_number,
  plan_name,
  amount,
  currency_symbol,
  payment_method,
  payment_id,
  created_at,
  status = "Paid",
  customer_name,
  customer_email,
  purchase_type
}: PurchaseHistoryCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await downloadInvoicePDF(invoice_number);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('razorpay')) return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Razorpay' };
    if (methodLower.includes('phonepe')) return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'PhonePe' };
    if (methodLower.includes('cash')) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Cash' };
    if (methodLower.includes('upi')) return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'UPI' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', label: method };
  };

  const methodStyle = getPaymentMethodBadge(payment_method);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeBadge = () => {
    if (purchase_type === 'Subscription') {
      return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Subscription' };
    } else if (purchase_type === 'Service') {
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Service Payment' };
    }
    return null;
  };

  const typeBadge = getTypeBadge();

  // Format amount with Indian number formatting
  const formattedAmount = amount.toLocaleString('en-IN');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200 group h-full flex flex-col">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Invoice #{invoice_number}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">
                {plan_name}
              </h3>
              {typeBadge && (
                <Badge className={`${typeBadge.bg} ${typeBadge.text} border-0 text-xs whitespace-nowrap`}>
                  {typeBadge.label}
                </Badge>
              )}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 whitespace-nowrap"
          >
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6 space-y-3 sm:space-y-4 flex-1">
        {/* Customer Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-xs sm:text-sm font-medium text-white">
              {getInitials(customer_name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
              {customer_name}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {customer_email || 'No email provided'}
            </p>
          </div>
        </div>

        {/* Amount and Payment Method - Desktop: row, Mobile: stack */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Amount */}
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-semibold text-base sm:text-lg text-gray-900 whitespace-nowrap">
                {currency_symbol}{formattedAmount}
              </p>
            </div>
          </div>

          {/* Divider - visible on desktop */}
          <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

          {/* Payment Method */}
          <div className="flex items-center gap-2 flex-1">
            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <Badge className={`${methodStyle.bg} ${methodStyle.text} border-0 text-xs sm:text-sm px-2 py-0.5 sm:px-2.5 sm:py-1 mt-0.5 whitespace-nowrap`}>
                {methodStyle.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Payment ID (if available) */}
        {payment_id && payment_id !== 'N/A' && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            <span className="font-medium text-gray-700">Payment ID:</span>
            <span className="font-mono text-gray-600 break-all">{payment_id}</span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span>
            {formatDate(new Date(created_at), 'long')}
          </span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="bg-gray-50 border-t p-3 sm:p-4 flex flex-col sm:flex-row gap-2 mt-auto">
        <Link href={`/purchase-history/${invoice_number}`} className="w-full sm:flex-1">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9"
          >
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            View Details
          </Button>
        </Link>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:flex-1 border-gray-300 hover:bg-white hover:border-blue-300 text-xs sm:text-sm h-9"
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
        >
          <Download className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0 ${isDownloading ? 'animate-pulse' : ''}`} />
          {isDownloading ? 'Downloading...' : 'Download Invoice'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PurchaseHistoryCard;