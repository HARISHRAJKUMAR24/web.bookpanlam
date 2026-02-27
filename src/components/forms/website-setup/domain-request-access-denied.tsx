"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpCircle, Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  message: string;
  planName: string;
  customDomainEnabled: boolean;
}

const DomainRequestAccessDenied = ({ message, planName, customDomainEnabled }: Props) => {
  return (
    <div className="grid gap-4 md:gap-6 px-3 sm:px-4 md:px-0">
      <Card className="border-2 border-red-200 overflow-hidden">
        {/* Header Section - Responsive */}
        <CardHeader className="bg-red-50 border-b border-red-200 p-4 sm:p-6">
          <div className="flex items-start sm:items-center gap-3 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg text-red-800 break-words">
                Access Restricted
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-red-600 break-words">
                Custom domain feature is not available in your current plan
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Content Section - Responsive */}
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-4">
          {/* Alert Message - Responsive */}
          <Alert className="bg-red-50 border-red-200 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-sm sm:text-base text-red-800 font-medium break-words">
                  Current Plan: {planName}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm text-red-700 mt-1 break-words">
                  {message}
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {/* Upgrade Section - Responsive */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <ArrowUpCircle className="h-5 w-5 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0 w-full">
                <h4 className="text-sm sm:text-base font-medium text-amber-800 break-words">
                  Upgrade to Access Custom Domain
                </h4>
                <p className="text-xs sm:text-sm text-amber-700 mt-1 mb-3 break-words">
                  Custom domain feature is available in select plans. Upgrade your plan to:
                </p>
                
                {/* Benefits List - Responsive */}
                <ul className="text-xs sm:text-sm text-amber-700 space-y-1.5 list-disc pl-4 sm:pl-5 break-words">
                  <li className="break-words">Use your own domain name (e.g., www.yourstore.com)</li>
                  <li className="break-words">Build brand credibility with custom domain</li>
                  <li className="break-words">Professional email addresses with your domain</li>
                </ul>

                {/* Button - Responsive */}
                <div className="mt-4 sm:mt-5">
                  <Link href="/all-plans" className="block sm:inline-block">
                    <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5">
                      <ArrowUpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">View Plans with Custom Domain</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainRequestAccessDenied;