// app/purchase-history/[invoice]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, Mail, Printer, ArrowLeft, Home, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getPaymentDetails, downloadInvoicePDF, emailInvoice, type PaymentDetails } from "@/lib/api/get-payment-details";

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceNumber = params.invoice as string;
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoiceNumber) {
      fetchPaymentDetails(invoiceNumber);
    }
  }, [invoiceNumber]);

  const fetchPaymentDetails = async (invoice: string) => {
    try {
      const result = await getPaymentDetails(invoice);

      if (result.success && result.data) {
        setPaymentDetails(result.data);
      } else {
        toast.error(result.message || "Failed to fetch invoice details");
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast.error("Error fetching invoice details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceNumber) return;

    try {
      const blob = await downloadInvoicePDF(invoiceNumber);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error downloading invoice");
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleEmailInvoice = async () => {
    if (!invoiceNumber || !paymentDetails) return;

    try {
      const result = await emailInvoice(invoiceNumber, paymentDetails.customer.email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending email");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    const currencySymbol = paymentDetails?.payment?.currency_symbol || '₹';
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `${currencySymbol}${formattedAmount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to retrieve invoice #{invoiceNumber}</p>
          <Link
            href="/purchase-history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Purchase History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8 px-3 sm:px-4 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Success Header - Responsive */}
        <div className="text-center mb-8 sm:mb-12 print:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
            <CheckCircle size={36} className="sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Invoice Details
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 px-2">
            Invoice #{paymentDetails.invoice.invoice_number} for {paymentDetails.plan.name}
          </p>
        </div>

        {/* Invoice Card - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8 mb-8 print:shadow-none print:border-none print:p-0">
          {/* Section 1: Company Name Centered - Responsive */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {paymentDetails.company.name}
            </h1>
            <div className="w-32 sm:w-48 h-[1px] bg-gray-300 mx-auto"></div>
            <div className="text-xs sm:text-sm text-gray-600 mt-2 px-2">
              {paymentDetails.company.address}
            </div>
          </div>

          {/* Section 2: Payment Status and Invoice Details - Responsive Grid */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Left side - Payment Status */}
            <div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Payment Status:</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    paymentDetails.invoice.status.toLowerCase() === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {paymentDetails.invoice.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Place of Supply:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.payment.place_of_supply}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Country of Supply:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.payment.country_of_supply}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Payment Method:</span>
                  <span className="text-xs sm:text-sm text-gray-900 uppercase">{paymentDetails.payment.method}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Payment ID:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-mono break-all">{paymentDetails.payment.payment_id}</span>
                </div>
              </div>
            </div>

            {/* Right side - Invoice Details */}
            <div className="md:text-right">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                INVOICE #{paymentDetails.invoice.invoice_number}
              </h2>
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between md:justify-end items-center gap-4">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Date:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{formatDate(paymentDetails.invoice.date)}</span>
                </div>
                <div className="flex justify-between md:justify-end items-center gap-4">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">Due Date:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{formatDate(paymentDetails.invoice.due_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Company and Customer Information - Responsive */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
            {/* Company Information */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3 sm:mb-4 border-b pb-2">Company Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Name:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-medium break-words">{paymentDetails.company.name}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Address:</span>
                  <span className="text-xs sm:text-sm text-gray-900 break-words">{paymentDetails.company.address}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Email:</span>
                  <span className="text-xs sm:text-sm text-gray-900 break-words">{paymentDetails.company.email}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Phone:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.company.phone}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">GST:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.company.gst_number}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">HSN:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.company.hsn}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3 sm:mb-4 border-b pb-2">Customer Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Name:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-medium">{paymentDetails.customer.name}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Address:</span>
                  <span className="text-xs sm:text-sm text-gray-900 break-words">{paymentDetails.customer.address_1}</span>
                </div>
                {paymentDetails.customer.address_2 && (
                  <div className="flex flex-col xs:flex-row">
                    <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Address 2:</span>
                    <span className="text-xs sm:text-sm text-gray-900 break-words">{paymentDetails.customer.address_2}</span>
                  </div>
                )}
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">City:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.city}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">State:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.state}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Postal:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.pin_code}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Country:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.country}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Email:</span>
                  <span className="text-xs sm:text-sm text-gray-900 break-words">{paymentDetails.customer.email}</span>
                </div>
                <div className="flex flex-col xs:flex-row">
                  <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">Phone:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.phone}</span>
                </div>
                {paymentDetails.customer.gst_number && (
                  <div className="flex flex-col xs:flex-row">
                    <span className="text-xs sm:text-sm text-gray-600 block xs:w-24">GST:</span>
                    <span className="text-xs sm:text-sm text-gray-900">{paymentDetails.customer.gst_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Invoice Items Table - Responsive */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="min-w-[300px] sm:min-w-full">
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-left font-bold text-gray-700">Plan Name</th>
                    <th className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-left font-bold text-gray-700">Expiry Date</th>
                    <th className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-3 text-right font-bold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentDetails.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-4 break-words">{item.description}</td>
                      <td className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        {(() => {
                          const startDate = new Date(paymentDetails.invoice.date);
                          const expiryDate = new Date(startDate);
                          expiryDate.setDate(startDate.getDate() + paymentDetails.plan.duration);
                          return formatDate(expiryDate.toISOString());
                        })()}
                      </td>
                      <td className="border border-gray-300 px-3 sm:px-6 py-2 sm:py-4 text-right whitespace-nowrap">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Amount Calculation with GST Breakdown - Responsive */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:w-80 md:w-96 space-y-2 sm:space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-700 font-medium">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(paymentDetails.payment.amount)}</span>
              </div>

              {/* Discount */}
              {paymentDetails.payment.discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">-{formatCurrency(paymentDetails.payment.discount)}</span>
                </div>
              )}

              {/* GST Breakdown for Exclusive Plans */}
              {paymentDetails.payment.gst_type === "exclusive" &&
                (paymentDetails.payment.gst_amount ?? 0) > 0 && (
                  <>
                    {/* CGST + SGST (same state) */}
                    {paymentDetails.payment.sgst_amount !== undefined &&
                      paymentDetails.payment.cgst_amount !== undefined &&
                      paymentDetails.payment.sgst_amount > 0 &&
                      paymentDetails.payment.cgst_amount > 0 && (
                        <>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                            <span>CGST ({paymentDetails.payment.gst_percentage / 2}%)</span>
                            <span>{formatCurrency(paymentDetails.payment.cgst_amount)}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                            <span>SGST ({paymentDetails.payment.gst_percentage / 2}%)</span>
                            <span>{formatCurrency(paymentDetails.payment.sgst_amount)}</span>
                          </div>
                        </>
                      )}

                    {/* IGST (different state) */}
                    {paymentDetails.payment.igst_amount !== undefined &&
                      paymentDetails.payment.igst_amount > 0 && (
                        <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                          <span>IGST ({paymentDetails.payment.gst_percentage}%)</span>
                          <span>{formatCurrency(paymentDetails.payment.igst_amount)}</span>
                        </div>
                      )}

                    {/* Total GST */}
                    <div className="flex justify-between border-t pt-1 sm:pt-2 text-xs sm:text-sm text-gray-800">
                      <span className="font-medium">Total GST</span>
                      <span className="font-medium">{formatCurrency(paymentDetails.payment.gst_amount ?? 0)}</span>
                    </div>
                  </>
                )}

              {/* Inclusive GST Display */}
              {paymentDetails.payment.gst_type === "inclusive" && (paymentDetails.payment.gst_amount ?? 0) > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-gray-700">
                  <span className="font-medium">GST ({paymentDetails.payment.gst_percentage}% Inclusive)</span>
                  <span className="font-medium">{formatCurrency(paymentDetails.payment.gst_amount ?? 0)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t-2 pt-3 sm:pt-4 mt-2 sm:mt-4">
                <div className="flex justify-between text-base sm:text-lg md:text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-700">{formatCurrency(paymentDetails.payment.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Footer Information */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-300">
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-900">
                <span className="font-bold">Amount In Words:</span> {paymentDetails.payment.amount_in_words}
              </p>
            </div>
            <p className="text-xs sm:text-sm italic text-gray-600 mb-3 sm:mb-4">
              This is a computer generated invoice and does not require a physical signature.
            </p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 text-center">
              Thank you for your business!
            </p>
          </div>

          {/* Section 7: Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 print:hidden">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              Download PDF
            </button>
            <button
              onClick={handlePrintInvoice}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
              Print
            </button>
            <button
              onClick={handleEmailInvoice}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
            >
              <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
              Email
            </button>
          </div>
        </div>

        {/* Section 8: Navigation Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
          >
            <Home size={18} className="sm:w-5 sm:h-5" />
            Go to Dashboard
          </Link>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all text-xs sm:text-sm"
          >
            View Other Plans
          </Link>
          <Link
            href="/purchase-history"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-xs sm:text-sm"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}