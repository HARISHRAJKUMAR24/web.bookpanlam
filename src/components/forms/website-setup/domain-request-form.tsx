"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateDomainRequest } from "@/lib/api/domain-request";
import { handleToast } from "@/lib/utils";
import { WebsiteSettings } from "@/types";
import { AlertCircle, ExternalLink, Info, CheckCircle, XCircle, Clock } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  data: {
    customDomain?: string;
    domainRequest?: {
      domain: string;
      status: 'pending' | 'active' | 'inactive' | 'rejected' | null;
      requestedAt: string | null;
    } | null;
    user_id?: string;
  } | null;
}

interface DomainRequest {
  domain: string;
  status: 'pending' | 'active' | 'inactive' | 'rejected' | null;
  requestedAt: string | null;
}

const DomainRequestForm = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [domainRequest, setDomainRequest] = useState<DomainRequest>({
    domain: "",
    status: null,
    requestedAt: null
  });

  // Load data when component mounts or data changes
  useEffect(() => {
    if (data) {
      setDomain(data.customDomain || "");
      if (data.domainRequest) {
        setDomainRequest({
          domain: data.domainRequest.domain || "",
          status: data.domainRequest.status || null,
          requestedAt: data.domainRequest.requestedAt || null
        });
      }
    }
  }, [data]);

  const sanitizeDomain = (input: string): string => {
    // Remove http://, https://, www., and trailing slashes
    return input
      .replace(/^(https?:\/\/)?(www\.)?/i, '')
      .split('/')[0]
      .trim();
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDomain(rawValue);
  };

  const validateDomain = (domain: string): boolean => {
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  // Get current time in IST format for storage
  const getISTTimeString = (): string => {
    const now = new Date();
    
    // Get IST components directly
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format IST date for display without date object conversion
  const formatISTDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    // If it's in format "YYYY-MM-DD HH:MM:SS"
    if (dateString.includes(' ')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      
      // Format for display
      const displayDay = day;
      const displayMonth = month;
      const displayYear = year;
      
      // Convert to 12-hour format
      let displayHour = parseInt(hour);
      const ampm = displayHour >= 12 ? 'PM' : 'AM';
      displayHour = displayHour % 12;
      displayHour = displayHour ? displayHour : 12; // the hour '0' should be '12'
      
      return `${displayDay}/${displayMonth}/${displayYear}, ${displayHour}:${minute} ${ampm}`;
    }
    
    return dateString;
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const sanitizedDomain = sanitizeDomain(domain);

    if (!sanitizedDomain) {
      toast.error("Please enter a domain name");
      setIsLoading(false);
      return;
    }

    if (!validateDomain(sanitizedDomain)) {
      toast.error("Please enter a valid domain name (e.g., mystore.com)");
      setIsLoading(false);
      return;
    }

    try {
      // Store time in IST format (not ISO)
      const istTimeString = getISTTimeString();
      
      const payload = {
        user_id: data?.user_id,
        customDomain: sanitizedDomain,
        domainRequest: {
          domain: sanitizedDomain,
          status: 'pending' as DomainRequest['status'],
          requestedAt: istTimeString // Store as IST string
        }
      };

      const response = await updateDomainRequest(payload);
      
      if (response.success) {
        setDomainRequest(payload.domainRequest);
        toast.success("Domain request submitted successfully!");
      } else {
        handleToast(response);
      }
    } catch (error: any) {
      toast.error(error.message);
    }

    setIsLoading(false);
  };

  const getStatusBadge = () => {
    if (!domainRequest.status) return null;

    const statusConfig = {
      pending: { 
        text: "Pending", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
      },
      active: { 
        text: "Active", 
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
      },
      inactive: { 
        text: "Inactive", 
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
      },
      rejected: { 
        text: "Rejected", 
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
      }
    };

    const config = statusConfig[domainRequest.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center ${config.className}`}>
        {config.icon}
        <span className="truncate">{config.text}</span>
      </span>
    );
  };

  // Check if domain is active
  const isDomainActive = domainRequest.status === 'active';
  const isDomainInactive = domainRequest.status === 'inactive';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Info Alert - Responsive */}
      <Alert className="bg-blue-50 border-blue-200 p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="h-4 w-4 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-sm sm:text-base text-blue-800 font-medium break-words">
              Read Before Sending Custom Domain Request
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm text-blue-700 mt-2 space-y-2 break-words">
              <p>
                Before we can set up your custom domain, you'll need to add some nameservers to your domain registrar account. 
                This will allow your custom domain to point to our website, so that we can display your website on your custom domain.
              </p>
              <p>
                Different domain registrars, such as GoDaddy and Namecheap, have different interfaces for adding nameservers. 
                If you're having trouble finding where to add the records, we recommend reaching out to your domain registrar's 
                support team. They should be able to guide you through the process or even add the nameservers for you.
              </p>
              <p className="font-medium">
                We will send you the DNS Records after you send us a Domain Request:
              </p>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Help Links - Responsive Stack on Mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-1">
        <Link 
          href="https://www.namecheap.com/support/knowledgebase/article.aspx/960/46/how-to-change-nameservers-for-a-domain/" 
          target="_blank"
          className="flex items-center gap-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium break-words"
        >
          <span className="truncate">How to Change Nameservers in Namecheap</span>
          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
        </Link>
        <Link 
          href="https://www.godaddy.com/help/change-nameservers-for-my-domains-664" 
          target="_blank"
          className="flex items-center gap-2 text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium break-words"
        >
          <span className="truncate">How to Change Nameservers in GoDaddy</span>
          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
        </Link>
      </div>

      {/* Warning Alert - Responsive */}
      <Alert className="bg-yellow-50 border-yellow-200 p-3 sm:p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <AlertDescription className="text-xs sm:text-sm text-yellow-700 break-words">
            Once you've added these nameservers, it will take 2-4 Maximum working days to complete the setup process.
          </AlertDescription>
        </div>
      </Alert>

      <Separator className="my-2 sm:my-4" />

      {/* Domain Request Form */}
      <Card className="border-2 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg break-words">Request Custom Domain</CardTitle>
          <CardDescription className="text-xs sm:text-sm break-words">
            Enter your domain name to request custom domain setup
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-4">
          {/* Status Display - Responsive */}
          {domainRequest.status && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Current Status:</span>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {getStatusBadge()}
                {domainRequest.domain && (
                  <span className="text-xs sm:text-sm text-gray-600 break-all">
                    Domain: <span className="font-mono">{domainRequest.domain}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Display Requested Time in IST - Responsive */}
          {domainRequest.requestedAt && (
            <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 break-words">
              <span className="font-medium">Requested on:</span> 
              <span>{formatISTDate(domainRequest.requestedAt)}</span>
            </div>
          )}

          {/* Domain Input - Responsive */}
          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm sm:text-base">
              Domain Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="domain"
              type="text"
              placeholder="mystore.com"
              value={domain}
              onChange={handleDomainChange}
              disabled={domainRequest.status === 'pending' || isLoading || isDomainActive || isDomainInactive}
              className="font-mono text-sm sm:text-base h-9 sm:h-10"
            />
            <p className="text-xs text-gray-500 mt-1 break-words">
              Do not use http:// or https:// or www. (e.g., mystore.com)
            </p>
          </div>

          {/* HTTP Warning - Responsive */}
          {domain && domain.includes('http') && (
            <Alert className="bg-blue-50 border-blue-200 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-xs text-blue-700 break-words">
                  We'll automatically remove http://, https://, and www. from your domain
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Status Messages - Responsive */}
          {domainRequest.status === 'pending' ? (
            <Alert className="bg-yellow-50 border-yellow-200 p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-xs sm:text-sm text-yellow-700 break-words">
                  Your domain request is pending review. We'll notify you once it's processed.
                </AlertDescription>
              </div>
            </Alert>
          ) : domainRequest.status === 'active' ? (
            <Alert className="bg-green-50 border-green-200 p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-xs sm:text-sm text-green-700 break-words">
                  Your domain is active! Your website is now accessible at <span className="font-mono font-semibold break-all">{domainRequest.domain}</span>
                </AlertDescription>
              </div>
            </Alert>
          ) : domainRequest.status === 'inactive' ? (
            <Alert className="bg-gray-50 border-gray-200 p-3">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-xs sm:text-sm text-gray-700 break-words">
                  Your domain is inactive. Please contact support for more information.
                </AlertDescription>
              </div>
            </Alert>
          ) : domainRequest.status === 'rejected' ? (
            <Alert className="bg-red-50 border-red-200 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <AlertDescription className="text-xs sm:text-sm text-red-700 break-words">
                  Your domain request was rejected. Please contact support for more information.
                </AlertDescription>
              </div>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* Submit Button - Responsive */}
      <div className="flex items-center justify-end mt-4 sm:mt-6 px-1">
        {!isDomainActive && !isDomainInactive ? (
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || domainRequest.status === 'pending'} 
            isLoading={isLoading}
            className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-6"
          >
            {domainRequest.status === 'pending' ? 'Request Pending' : 'Submit Request'}
          </Button>
        ) : (
          <Button 
            variant="outline"
            className={`w-full sm:w-auto ${
              isDomainActive 
                ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' 
                : 'text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100'
            } text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-6`}
            disabled
          >
            {isDomainActive ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Domain Active</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Domain Inactive</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DomainRequestForm;