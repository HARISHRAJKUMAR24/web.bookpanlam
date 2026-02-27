import { getDomainRequestSettings } from "@/lib/api/domain-request";
import DomainRequestForm from "@/components/forms/website-setup/domain-request-form";
import DomainRequestAccessDenied from "@/components/forms/website-setup/domain-request-access-denied";
import { checkCustomDomainAccess } from "@/lib/api/domain-request"; // You'll need to create this API function
import { cookies } from "next/headers";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DomainRequestPage = async () => {
  // Get user_id from cookies
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  if (!userId) {
    return (
      <div>
        <div className="mb-9 space-y-1.5">
          <h3 className="font-medium">Custom Domain</h3>
          <p className="text-black/50 text-sm font-medium">
            Request a custom domain for your website
          </p>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-medium">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Please log in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user's plan supports custom domain
  const accessCheck = await checkCustomDomainAccess(userId);
  
  if (!accessCheck.success || !accessCheck.can_access) {
    return (
      <div>
        <div className="mb-9 space-y-1.5">
          <h3 className="font-medium">Custom Domain</h3>
          <p className="text-black/50 text-sm font-medium">
            Request a custom domain for your website
          </p>
        </div>
        
        <DomainRequestAccessDenied 
          message={accessCheck.message || "Your current plan does not support custom domain."}
          planName={accessCheck.plan_name}
          customDomainEnabled={accessCheck.custom_domain_enabled}
        />
      </div>
    );
  }

  const response = await getDomainRequestSettings();
  
  // Extract data from response and add user_id
  let data = { user_id: userId };
  
  if (response?.success && response.data) {
    data = {
      ...response.data,
      user_id: userId
    };
  }

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Custom Domain</h3>
        <p className="text-black/50 text-sm font-medium">
          Request a custom domain for your website
        </p>
      </div>

      <DomainRequestForm data={data} />
    </div>
  );
};

export default DomainRequestPage;