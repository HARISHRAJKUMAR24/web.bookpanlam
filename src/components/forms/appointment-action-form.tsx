"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/lib/api/appointments";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface AppointmentActionFormProps {
  appointment: any;
}

const AppointmentActionForm = ({ appointment }: AppointmentActionFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(appointment?.status || 'pending');
  const [showModal, setShowModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUpiMethod, setSelectedUpiMethod] = useState("");

  const paymentMethod = appointment?.payment_method?.toLowerCase() || "";
  const currentStatus = appointment?.status?.toLowerCase() || "";

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: "Paid",
      pending: "Pending",
      waiting: "Waiting",
      cancelled: "Cancelled",
      cancel: "Cancelled",
      refund: "Refund",
      refunded: "Refunded",
    };
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus && newStatus !== currentStatus) {
      setSelectedStatus(newStatus);

      // Check if UPI method selection is needed
      if (newStatus === "paid" &&
          ["cash", "coh", "cod"].includes(paymentMethod) &&
          ["pending", "waiting", "bending"].includes(currentStatus)) {
        setShowUpiModal(true);
      } else {
        setShowModal(true);
      }
    }
  };

  const handleUpiConfirm = () => {
    if (!selectedUpiMethod) {
      setErrorMessage("Please select a UPI payment method");
      setShowErrorModal(true);
      return;
    }
    setShowUpiModal(false);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      let updatedPaymentMethod: string | undefined = undefined;

      if (selectedStatus === "paid" &&
          ["cash", "coh", "cod"].includes(paymentMethod) &&
          ["pending", "waiting", "bending"].includes(currentStatus) &&
          selectedUpiMethod) {
        updatedPaymentMethod = `${paymentMethod}{upi:${selectedUpiMethod}}`;
      }

      const result = await updateAppointmentStatus(
        appointment.appointmentId || appointment.appointment_id,
        selectedStatus,
        updatedPaymentMethod
      );

      if (result.success) {
        toast.success("Appointment status updated successfully");
        setShowModal(false);
        router.refresh();
      } else {
        setErrorMessage(result.message || 'Failed to update status');
        setShowModal(false);
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      setErrorMessage(error.message || 'Please try again');
      setShowModal(false);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
      setSelectedUpiMethod("");
    }
  };

  const getModalVariant = () => {
    if (selectedStatus === 'cancel' || selectedStatus === 'cancelled') return 'danger';
    if (selectedStatus === 'refund' || selectedStatus === 'refunded') return 'danger';
    if (selectedStatus === 'waiting') return 'warning';
    return 'primary';
  };

  // Get available status options based on current status and payment method
  const getAvailableOptions = () => {
    let availableOptions: string[] = [];

    // ONLINE PAYMENTS
    if (["razorpay", "phonepay", "phonepe", "payu", "upi"].includes(paymentMethod)) {
      if (currentStatus === "paid") {
        if (!["refund", "refunded", "cancelled"].includes(currentStatus)) {
          availableOptions.push("refund");
        }
      } else if (currentStatus === "pending") {
        if (currentStatus !== "paid") {
          availableOptions.push("paid");
        }
      }
    }
    // CASH/COH/COD PAYMENTS
    else if (["cash", "coh", "cod"].includes(paymentMethod)) {
      if (["pending", "waiting", "bending"].includes(currentStatus)) {
        if (currentStatus !== "paid") availableOptions.push("paid");
        if (!["cancelled", "cancel"].includes(currentStatus)) availableOptions.push("cancel");
      } else if (currentStatus === "paid") {
        if (!["refund", "refunded"].includes(currentStatus)) availableOptions.push("refund");
        if (!["cancelled", "cancel"].includes(currentStatus)) availableOptions.push("cancel");
      }
    }
    // DEFAULT
    else {
      if (["pending", "waiting", "bending"].includes(currentStatus)) {
        if (currentStatus !== "paid") availableOptions.push("paid");
        if (!["cancelled", "cancel"].includes(currentStatus)) availableOptions.push("cancel");
      } else if (currentStatus === "paid") {
        if (!["refund", "refunded"].includes(currentStatus)) availableOptions.push("refund");
        if (!["cancelled", "cancel"].includes(currentStatus)) availableOptions.push("cancel");
      }
    }

    // Remove current status from options
    availableOptions = availableOptions.filter(option => option !== currentStatus);

    return availableOptions;
  };

  const availableOptions = getAvailableOptions();
  const isDisabled = availableOptions.length === 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Update Appointment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm sm:text-base">Current Status</Label>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-md">
                <span className={`font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm ${
                  currentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  currentStatus === 'waiting' ? 'bg-orange-100 text-orange-800' :
                  currentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                  currentStatus === 'refund' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusDisplay(currentStatus)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus" className="text-sm sm:text-base">Change Status To</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={handleStatusChange}
                disabled={isDisabled || isLoading}
              >
                <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder={isDisabled ? "No actions available" : "Select new status"} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.length > 0 ? (
                    availableOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-sm sm:text-base">
                        {getStatusDisplay(option)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-options" disabled className="text-sm sm:text-base">
                      No available status changes
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {isDisabled && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  No other status changes available for this appointment.
                </p>
              )}
            </div>

            {/* <div className="pt-2 sm:pt-4">
              <Button
                type="button"
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={isDisabled || isLoading || selectedStatus === currentStatus}
                className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : "Update Status"}
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUpiMethod("");
        }}
        onConfirm={handleConfirm}
        title={`Confirm Status Change`}
        description={`Are you sure you want to change the status of appointment #${appointment.appointmentId || appointment.appointment_id} from "${getStatusDisplay(currentStatus)}" to "${getStatusDisplay(selectedStatus)}"?${selectedUpiMethod ? `\n\nPayment method will be updated to: ${paymentMethod.toUpperCase()}{UPI:${selectedUpiMethod.toUpperCase()}}` : ''}`}
        confirmText={isLoading ? "Updating..." : "Confirm Change"}
        variant={getModalVariant()}
      />

      {/* UPI Method Selection Modal - Responsive */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-3 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => {
                setShowUpiModal(false);
                setSelectedUpiMethod("");
              }}
            />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-sm sm:max-w-md p-3 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg sm:rounded-2xl">
              <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4">
                Select UPI Payment Method
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                How was the payment received for appointment #{appointment.appointmentId || appointment.appointment_id}?
              </p>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {["gpay", "paytm", "phonepe", "others"].map((method) => (
                  <div key={method} className="flex items-center">
                    <input
                      type="radio"
                      id={`upi-${method}`}
                      name="upiMethod"
                      value={method}
                      checked={selectedUpiMethod === method}
                      onChange={(e) => setSelectedUpiMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor={`upi-${method}`}
                      className="ml-3 block text-xs sm:text-sm font-medium text-gray-700 capitalize"
                    >
                      {method === "gpay" ? "Google Pay" :
                        method === "phonepe" ? "PhonePe" :
                          method.charAt(0).toUpperCase() + method.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={() => {
                    setShowUpiModal(false);
                    setSelectedUpiMethod("");
                    setSelectedStatus(currentStatus);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  onClick={handleUpiConfirm}
                  disabled={!selectedUpiMethod}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Status Update Failed"
        description={errorMessage}
        confirmText="OK"
        variant="danger"
      />
    </>
  );
};

export default AppointmentActionForm;