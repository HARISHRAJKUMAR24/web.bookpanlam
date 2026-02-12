// components/cards/purchase-history-card.tsx
"use client";

import { useState } from "react";
import { Calendar, Download, Eye, IndianRupee, Receipt, User, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { downloadInvoicePDF } from "@/lib/api/get-payment-details";
import { toast } from "sonner";

interface PurchaseHistoryCardProps {
  id: number;
  invoice_number: number;
  plan_name: string;
  amount: number;
  currency_symbol: string;
  payment_method: string;
  payment_id: string;
  created_at: string;
  status?: string;
  customer_name: string;
  customer_email: string;
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
  customer_email
}: PurchaseHistoryCardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await downloadInvoicePDF(invoice_number.toString());
      
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
    if (methodLower.includes('phonepe') || methodLower.includes('phonepay')) return { bg: 'bg-purple-100', text: 'text-purple-800', label: 'PhonePe' };
    if (methodLower.includes('payu')) return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'PayU' };
    if (methodLower.includes('cash')) return { bg: 'bg-green-100', text: 'text-green-800', label: 'Cash' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', label: method };
  };

  const methodStyle = getPaymentMethodBadge(payment_method);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200 group">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Invoice #{invoice_number}</span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{plan_name}</h3>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{customer_name}</p>
            <p className="text-xs text-gray-500 truncate">{customer_email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <IndianRupee className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-semibold text-gray-900">{currency_symbol}{amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment</p>
              <Badge className={`${methodStyle.bg} ${methodStyle.text} border-0 text-xs px-2 py-0.5`}>
                {methodStyle.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Purchased on {formatDate(new Date(created_at), 'long')}</span>
          
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate font-mono">Transaction ID: {payment_id}</span>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4 flex gap-2">
        {/* FIXED: Don't use asChild, just wrap Button inside Link */}
        <Link href={`/purchase-history/${invoice_number}`} className="flex-1">
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Invoice
          </Button>
        </Link>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-300 hover:bg-white hover:border-blue-300"
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
        >
          <Download className={`h-4 w-4 mr-1 ${isDownloading ? 'animate-pulse' : ''}`} />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PurchaseHistoryCard;