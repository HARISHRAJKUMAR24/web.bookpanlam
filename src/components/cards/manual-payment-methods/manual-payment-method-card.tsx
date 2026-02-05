import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, More, Trash, Wallet } from "iconsax-react";

import { uploadsUrl } from "@/config";
import Image from "next/image";
import { ManualPaymentMethodCardProps } from "@/types";
import { Button } from "../../ui/button";
import { deleteManualPaymentMethod } from "@/lib/api/manual-payment-methods";
import { toast } from "sonner";
import ManualPaymentMethodForm from "../../forms/settings/payment-settings/manual-payment-method-form";

const ManualPaymentMethodCard = ({
  data,
  setReload,
}: ManualPaymentMethodCardProps) => {
  const handleDelete = async () => {
    try {
      const response = await deleteManualPaymentMethod(data.id);
      toast.success(response.message);
      setReload && setReload(Math.random());
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getUploadUrl = (path?: string | null) => {
    if (!path) return "";
    
    // Check if it's already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // If it's a relative path, prepend the base URL
    // Remove any leading slashes
    const cleanPath = path.replace(/^\//, '');
    
    // Check if it already starts with uploads/
    if (cleanPath.startsWith('uploads/')) {
      // It's already a relative path from public/uploads
      return `${uploadsUrl}/${cleanPath}`;
    }
    
    // For legacy paths that might be stored differently
    return `${uploadsUrl}/${cleanPath}`;
  };

  // Get icon URL
  const iconUrl = getUploadUrl(data.icon);
  
  // Log for debugging
  console.log('Icon data:', {
    raw: data.icon,
    processed: iconUrl,
    uploadsUrl: uploadsUrl
  });

  return (
    <div className="group relative flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-900/50">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/0 to-blue-50/0 group-hover:from-blue-50/20 group-hover:via-blue-50/10 group-hover:to-blue-50/0 dark:from-blue-900/0 dark:via-blue-900/0 dark:to-blue-900/0 dark:group-hover:from-blue-900/10 dark:group-hover:via-blue-900/5 dark:group-hover:to-blue-900/0 rounded-xl transition-all duration-500 pointer-events-none" />

      <div className="flex items-center gap-5 relative z-10">
        {/* Icon Container with gradient border */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg blur-sm opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
          <div className="relative border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg w-16 h-16 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow duration-300">
            {iconUrl ? (
              <div className="relative w-12 h-12">
                <Image
                  src={iconUrl}
                  alt={data.name}
                  fill
                  sizes="48px"
                  className="object-contain filter group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error('Image load error for:', iconUrl);
                    // Fallback to wallet icon if image fails to load
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                    
                    const parent = imgElement.parentElement;
                    if (parent) {
                      // Add fallback wallet icon
                      parent.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
                            <circle cx="16" cy="12" r="1.5"/>
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            ) : (
              <Wallet className="w-7 h-7 text-blue-600 dark:text-blue-400" variant="Bold" />
            )}
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="space-y-1">
          <span className="font-semibold text-lg block text-gray-900 dark:text-gray-100 tracking-tight">
            {data.name}
          </span>
          
          {/* Show UPI ID if available */}
          {data.upi_id && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">UPI ID:</span> {data.upi_id}
            </p>
          )}
          
      {data.instructions && (
  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md line-clamp-2">
    {data.instructions}
  </p>
)}

          
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Manual Payment
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {data.status === 'active' ? (
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="flex items-center">
                  {/* <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" /> */}
                  {/* Inactive */}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative z-10 h-10 w-10 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group/btn"
          >
            <More className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover/btn:text-gray-900 dark:group-hover/btn:text-gray-100 transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 border-gray-200 dark:border-gray-800 shadow-lg rounded-xl"
        >
          <DropdownMenuLabel className="font-semibold text-gray-900 dark:text-gray-100 px-3 py-2">
            Payment Method Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
          <DropdownMenuGroup>
            {/* Edit Option */}
            <ManualPaymentMethodForm
              isEdit={true}
              data={data}
              setReload={setReload}
            >
              <DropdownMenuItem
                className="px-3 py-2.5 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600 dark:focus:text-blue-400 rounded-lg mx-1 my-0.5 transition-colors duration-150"
                onSelect={(e) => {
                  e.preventDefault();
                  document.body.click();
                }}
              >
                <div className="flex items-center w-full">
                  <Edit variant="Bold" className="mr-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Edit</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Modify payment method details
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            </ManualPaymentMethodForm>

            <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />

            {/* Delete Option */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="px-3 py-2.5 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 rounded-lg mx-1 my-0.5 transition-colors duration-150"
                  onSelect={(e) => {
                    e.preventDefault();
                    document.body.click();
                  }}
                >
                  <div className="flex items-center w-full">
                    <Trash variant="Bold" className="mr-3 h-4 w-4 text-red-600 dark:text-red-400" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">Delete</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Remove payment method permanently
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl">
                <div className="relative">
                  {/* Warning Icon */}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                    <Trash className="h-6 w-6 text-red-600 dark:text-red-400" variant="Bold" />
                  </div>

                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Delete Payment Method
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-gray-600 dark:text-gray-400 pt-2">
                      This will permanently delete <span className="font-semibold text-gray-900 dark:text-gray-200">{data.name}</span> from your payment methods. This action cannot be undone and may affect ongoing transactions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                    <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 mt-2 sm:mt-0 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Delete Payment Method
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ManualPaymentMethodCard;