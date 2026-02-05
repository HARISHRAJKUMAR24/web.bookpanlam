"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ManualPaymentMethodFormProps } from "@/types";
import { uploadsUrl } from "@/config";

import {
  addManualPaymentMethod,
  updateManualPaymentMethod,
} from "@/lib/api/manual-payment-methods";
import { handleToast } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Smartphone } from "lucide-react";

const ManualPaymentMethodForm = ({
  children,
  isEdit,
  data,
  setReload,
}: ManualPaymentMethodFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /* ---------------- Form state ---------------- */
  const [name, setName] = useState(data?.name ?? "");
  const [instructions, setInstructions] = useState(
    data?.instructions ?? ""
  );
  const [upiId, setUpiId] = useState(data?.upi_id ?? "");
  const [icon, setIcon] = useState<File | string | null>(
    data?.icon ?? null
  );

  /* ---------------- Save handler ---------------- */
const handleSave = async () => {
  if (!name.trim() || !instructions.trim()) {
    toast.error("Name and instructions are required");
    return;
  }

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("instructions", instructions);
    formData.append("upi_id", upiId);

   
// ⚡ Case 1: user removed icon
if (icon === null && typeof data?.icon === "string") {
  formData.append("remove_icon", "1");
  formData.append("old_icon", data.icon);
}

    // ⚡ Case 2: new file uploaded
    if (icon instanceof File) {
      formData.append("icon", icon);
      formData.append("old_icon", data?.icon ?? "");
    }

    const response = !isEdit
      ? await addManualPaymentMethod(formData)
      : await updateManualPaymentMethod(data?.id!, formData);

    handleToast(response);

    if (response.success) {
      setOpen(false);
      setReload?.(Math.random());

      if (!isEdit) {
        setName("");
        setUpiId("");
        setInstructions("");
        setIcon(null);
      }
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to save payment method");
  }

  setIsLoading(false);
};


  const handleUpiTemplate = () => {
    setName("UPI Payment");
    setInstructions(`📱 How to Pay via UPI:
1. Open your UPI app (Google Pay, PhonePe, Paytm, etc.)
2. Enter the UPI ID shown above
3. Enter the exact payment amount
4. Add a reference/note if required
5. Complete the transaction
6. Share the payment screenshot with us`);

    toast.success("UPI template applied");
  };

  // Helper to resolve icon URL for preview
  const resolveIconUrl = () => {
    if (!icon) return null;
    if (icon instanceof File) {
      return URL.createObjectURL(icon);
    }
    return icon;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <DialogHeader className="px-8 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isEdit ? "Edit Payment Method" : "Add Payment Method"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure manual payment details for customers
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(80vh-180px)]">
            <div className="px-8 pb-6 space-y-6 pt-4">
              {/* Form Fields */}
              <div className="space-y-6">
                {/* Payment Logo */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Payment Logo
                  </label>

                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="h-16 w-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {icon ? (
                        <img
                          src={resolveIconUrl()!}
                          alt="Payment Logo"
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-xs text-gray-500">Invalid Image</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">No Logo</span>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="paymentLogo"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setIcon(e.target.files[0]);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("paymentLogo")?.click()}
                        >
                          Upload Logo
                        </Button>
                        
                        {icon && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIcon(null)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optional. Recommended: 128×128px PNG/JPG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Payment Method Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-colors"
                    placeholder="e.g., UPI Payment, Google Pay, PhonePe"
                    required
                  />
                </div>

                {/* UPI ID / Payment Details */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    UPI ID / Payment Details
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-colors"
                      placeholder="example@upi or account number"
                    />
                    {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        Optional
                      </span>
                    </div> */}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Leave empty if not applicable
                  </p>
                </div>

                {/* Payment Instructions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Payment Instructions *
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUpiTemplate}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Use UPI Template
                    </Button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 transition-colors resize-none"
                      placeholder="Enter clear step-by-step payment instructions..."
                      required
                    />
                    <div className="absolute bottom-3 right-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {instructions.length} characters
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Customers will see these instructions during checkout
                  </p>
                </div>
              </div>

              {/* Preview Note */}
              {/* <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                      Preview Information
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      The information will be displayed to customers in this order:
                      1. Payment Logo → 2. Payment Name → 3. UPI ID → 4. Instructions
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          </ScrollArea>

          {/* Footer */}
          <DialogFooter className="px-8 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Cancel
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  isLoading={isLoading}
                  disabled={!name.trim() || !instructions.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "Saving..."
                    : isEdit
                      ? "Update Payment Method"
                      : "Add Payment Method"
                  }
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualPaymentMethodForm;