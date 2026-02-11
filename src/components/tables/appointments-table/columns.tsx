"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { updateAppointmentStatus } from "@/lib/api/appointments";
import { useState } from "react";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { MoreVertical, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<any>[] = [
  {
    header: "ID",
    accessorKey: "appointment_id",
    cell: ({ row }) => {
      const id = row.original.appointment_id;
      return (
        <Link
          href={`/appointments/${id}`}
          className="font-medium text-primary hover:text-primary/80 transition-colors text-sm sm:text-base"
        >
          #{id}
        </Link>
      );
    },
  },

  {
    header: "Customer",
    accessorKey: "customer_id",
    cell: ({ row }) => (
      <span className="text-sm sm:text-base">{row.original.customer_id}</span>
    ),
  },

  // {
  //   header: "Doctor / Dept",
  //   cell: ({ row }) => {
  //     const d = row.original;
  //     const serviceName = d.service_name;

  //     let isDepartment = false;
  //     let displayContent = null;

  //     try {
  //       if (serviceName && serviceName.startsWith('{')) {
  //         const serviceData = JSON.parse(serviceName);
  //         isDepartment = serviceData.type === 'department';

  //         if (isDepartment) {
  //           // For department: Show department_name with Dept badge
  //           const deptName = serviceData.department_name || "Department";
  //           displayContent = (
  //             <div className="space-y-0.5 sm:space-y-1">
  //               <div className="flex items-center gap-1 sm:gap-2">
  //                 <Badge
  //                   variant="outline"
  //                   className="bg-blue-50 border-blue-200 text-blue-700 text-xs px-1.5 sm:px-2 py-0.5"
  //                 >
  //                   Dept
  //                 </Badge>
  //                 <span className="text-xs sm:text-sm">{serviceData.department_id}</span>
  //               </div>
  //               <div className="font-medium text-xs sm:text-sm truncate">
  //                 {deptName}
  //               </div>
  //             </div>
  //           );
  //         } else if (serviceData.type === 'category') {
  //           // For category: Show doctor_name and specialization
  //           const doctorName = serviceData.doctor_name || "No Doctor";
  //           const specialization = serviceData.specialization;

  //           displayContent = (
  //             <div className="space-y-0.5 sm:space-y-1">
  //               <div className="font-medium text-xs sm:text-sm truncate">{doctorName}</div>
  //               {specialization && (
  //                 <div className="text-xs text-gray-500 truncate">{specialization}</div>
  //               )}
  //             </div>
  //           );
  //         } else {
  //           // Fallback for other types
  //           displayContent = (
  //             <span className="text-gray-500 text-sm">
  //               {serviceData.doctor_name || serviceData.department_name || "Unknown"}
  //             </span>
  //           );
  //         }
  //       } else {
  //         // If not JSON, try to use service_reference_type
  //         isDepartment = d.service_reference_type === 'department';

  //         if (isDepartment) {
  //           displayContent = (
  //             <div className="space-y-0.5 sm:space-y-1">
  //               <div className="flex items-center gap-1 sm:gap-2">
  //               </div>
  //               <div className="font-medium text-xs sm:text-sm truncate">
  //                 {serviceName || d.service_reference_id || "Department"}
  //               </div>
  //             </div>
  //           );
  //         } else {
  //           displayContent = (
  //             <div className="space-y-0.5 sm:space-y-1">
  //               <div className="font-medium text-xs sm:text-sm truncate">
  //                 {serviceName || "No Info"}
  //               </div>
  //             </div>
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error parsing service data:", error);
  //       displayContent = (
  //         <span className="text-gray-500 text-sm">Error loading data</span>
  //       );
  //     }

  //     return displayContent;
  //   },
  // },

  {
    header: "Service",
    cell: ({ row }) => {
      const d = row.original;
      const serviceName = d.service_name;
      let displayText = "N/A";

      try {
        // Check if service_name is a JSON string
        if (serviceName && serviceName.startsWith('{')) {
          const serviceData = JSON.parse(serviceName);

          if (serviceData.type === 'department') {
            // For department: Show department_name only
            displayText = serviceData.department_name || "Department";
          } else if (serviceData.type === 'category') {
            // For category: Show doctor_name and specialization
            const doctorName = serviceData.doctor_name || "";
            const specialization = serviceData.specialization || "";
            displayText = `${doctorName}${specialization ? ` - ${specialization}` : ''}`;
          } else {
            // Fallback for other types
            displayText = serviceData.doctor_name || serviceData.department_name || JSON.stringify(serviceData);
          }
        } else {
          // If it's not JSON, use as is
          displayText = serviceName || "N/A";
        }
      } catch (error) {
        console.error("Error parsing service_name:", error);
        displayText = serviceName || "N/A";
      }

      return (
        <span className="text-sm sm:text-base truncate" title={displayText}>
          {displayText}
        </span>
      );
    },
  },

  {
    header: "Date / Time",
    cell: ({ row }) => {
      const d = row.original;
      return (
        <div className="text-xs sm:text-sm">
          {formatDate(new Date(d.appointment_date), 'short')}
          <br />
          <span className="text-xs text-gray-500">
            {d.slot_from?.substring(0, 5)} - {d.slot_to?.substring(0, 5)}
          </span>
        </div>
      );
    },
  },

  {
    header: "Amount",
    accessorKey: "total_amount",
    cell: ({ row }) => {
      const d = row.original;
      const isDepartment = d.service_reference_type === 'department';
      // const displayAmount = `${d.currency || "INR"} ${d.total_amount || "0"}`;
     const displayAmount = parseFloat(d.total_amount || "0").toString();

      if (isDepartment) {
        return (
          <div className="space-y-0.5 sm:space-y-1">
            <div className="font-medium text-xs sm:text-sm">{displayAmount}</div>
            {d.token_count > 1 && (
              <div className="text-xs text-gray-500">
                {d.token_count} × {(parseFloat(d.total_amount) / d.token_count).toFixed(2)}
              </div>
            )}
          </div>
        );
      }

      return (
        <span className="text-xs sm:text-sm">{displayAmount}</span>
      );
    },
  },

  {
    header: "Payment",
    accessorKey: "payment_method",
    cell: ({ row }) => {
      const method = row.original.payment_method;
      const isDepartment = row.original.service_reference_type === 'department';

      if (isDepartment && method === 'cash') {
        return (
          <div className="space-y-0.5 sm:space-y-1">
            <div className="font-medium text-xs sm:text-sm">Cash</div>
            <div className="text-xs text-gray-500">At Hospital</div>
          </div>
        );
      }

      return (
        <span className="text-xs sm:text-sm uppercase">{method || "N/A"}</span>
      );
    },
  },

  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status || "pending";
      const isDepartment = row.original.service_reference_type === 'department';

      let style = {
        bg: "",
        border: "",
        text: "",
      };

      switch (status.toLowerCase()) {
        case "paid":
          style = { bg: "bg-green-50", border: "border-green-500", text: "text-green-600" };
          break;
        case "pending":
          style = { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-600" };
          break;
        case "waiting":
          style = { bg: "bg-orange-50", border: "border-orange-500", text: "text-orange-600" };
          break;
        case "cancelled":
        case "canceled":
        case "cancel":
          style = { bg: "bg-red-50", border: "border-red-500", text: "text-red-600" };
          break;
        case "refund":
        case "refunded":
          style = { bg: "bg-red-950/10", border: "border-red-800", text: "text-red-800" };
          break;
        default:
          style = { bg: "bg-gray-50", border: "border-gray-400", text: "text-gray-500" };
      }

      return (
        <div className="space-y-0.5 sm:space-y-1">
          <Badge
            variant="outline"
            className={`font-medium text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 ${style.bg} ${style.border} ${style.text}`}
          >
            {status.length > 6 ? status.substring(0, 6).toUpperCase() : status.toUpperCase()}
          </Badge>
          {isDepartment && (
            <div className="text-xs text-gray-500">Tokens: {row.original.token_count || 1}</div>
          )}
        </div>
      );
    },
  },



  {
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      const [showModal, setShowModal] = useState(false);
      const [showUpiModal, setShowUpiModal] = useState(false);
      const [showErrorModal, setShowErrorModal] = useState(false);
      const [errorMessage, setErrorMessage] = useState("");
      const [selectedStatus, setSelectedStatus] = useState("");
      const [selectedUpiMethod, setSelectedUpiMethod] = useState("");
      const [isLoading, setIsLoading] = useState(false);
      const [showDropdown, setShowDropdown] = useState(false);

      const paymentMethod = data.payment_method?.toLowerCase() || "";
      const currentStatus = data.status?.toLowerCase() || "";
      const isDepartment = data.service_reference_type === 'department';

      const getStatusDisplay = (status: string) => {
        const statusMap: Record<string, string> = {
          paid: "Paid", pending: "Pending", waiting: "Waiting",
          cancelled: "Cancelled", cancel: "Cancelled",
          refund: "Refund", refunded: "Refunded",
        };
        return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
      };

      const handleSelectChange = (newStatus: string) => {
        if (newStatus && newStatus !== "Select") {
          setSelectedStatus(newStatus);
          setShowDropdown(false);

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
            data.appointment_id,
            selectedStatus,
            updatedPaymentMethod
          );

          if (result.success) {
            setShowModal(false);
            window.location.reload();
          } else {
            setErrorMessage(result.message || 'Unknown error occurred');
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
        }
      };

      const getModalVariant = () => {
        if (selectedStatus === 'cancel' || selectedStatus === 'cancelled') return 'danger';
        if (selectedStatus === 'refund' || selectedStatus === 'refunded') return 'danger';
        if (selectedStatus === 'waiting') return 'warning';
        return 'primary';
      };

      let availableOptions = [];

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

      const isDropdownDisabled = availableOptions.length === 0;

      return (
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={`/appointments/${data.appointment_id}`}
            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye size={16} className="sm:size-4" />
          </Link>

          <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
            <DropdownMenuTrigger asChild>
              <button
                className={`p-1.5 sm:p-2 rounded-md border transition-colors ${isDropdownDisabled
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 border-gray-200'
                  }`}
                disabled={isDropdownDisabled || isLoading}
                title={isDropdownDisabled ? "No actions available" : "Change Status"}
              >
                <MoreVertical size={16} className="sm:size-4" />
              </button>
            </DropdownMenuTrigger>
            {!isDropdownDisabled && (
              <DropdownMenuContent align="end" className="w-40">
                {availableOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleSelectChange(option)}
                    className="cursor-pointer"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>

          <ConfirmationModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedUpiMethod("");
            }}
            onConfirm={handleConfirm}
            title={`Confirm Status Change`}
            description={`Are you sure you want to change the status of appointment #${data.appointment_id} from "${getStatusDisplay(currentStatus)}" to "${getStatusDisplay(selectedStatus)}"?${selectedUpiMethod ? `\n\nPayment method will be updated to: ${paymentMethod.toUpperCase()}{UPI:${selectedUpiMethod.toUpperCase()}}` : ''
              }`}
            confirmText={isLoading ? "Updating..." : "Confirm Change"}
            variant={getModalVariant()}
          />

          {showUpiModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
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
                <div className="inline-block w-full max-w-md p-4 sm:p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3 sm:mb-4">
                    Select UPI Payment Method
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                    How was the payment received for appointment #{data.appointment_id}?
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
                          className="ml-3 block text-sm font-medium text-gray-700 capitalize"
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
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      onClick={() => {
                        setShowUpiModal(false);
                        setSelectedUpiMethod("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
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

          <ConfirmationModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            onConfirm={() => setShowErrorModal(false)}
            title="Status Update Failed"
            description={errorMessage}
            confirmText="OK"
            variant="danger"
          />
        </div>
      );
    },
  },
];