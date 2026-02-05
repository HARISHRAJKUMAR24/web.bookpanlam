"use client";

import { useEffect, useState } from "react";

export default function SuspensionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const user = await res.json();
          if (user?.is_suspended === 1) {
            setSuspended(true);
            setReason(user?.suspension_reason || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user status:", error);
      } finally {
        setReady(true);
      }
    }

    check();
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (suspended) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Account Suspended
            </h1>
            <p className="text-gray-600 text-lg">
              Access to your account has been restricted
            </p>
          </div>

          {/* Reason Box */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-5 mb-8">
            <div className="flex items-start">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Suspension Reason</h3>
                <p className="text-red-700 text-sm leading-relaxed">
                  {reason || "Your account has been temporarily suspended due to violations of our Terms of Service or Community Guidelines. This action was taken to ensure the safety and integrity of our platform."}
                </p>
              </div>
            </div>
          </div>

          {/* Steps to Resolve */}
          <div className="mb-10">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">To Restore Your Access:</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <p className="text-gray-700">Review our <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a> and <a href="/guidelines" className="text-blue-600 hover:text-blue-800 underline">Community Guidelines</a></p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <p className="text-gray-700">Contact our support team with any questions or to appeal this decision</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <p className="text-gray-700">Provide any requested information for account review</p>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="space-y-4">
            <a
              href="mailto:support@yourdomain.com?subject=Account%20Suspension%20Appeal"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              Contact Support Team
            </a>
            
            <a
              href="/appeal"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              Submit Appeal Form
            </a>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Need immediate assistance? Call our support line at 
              <a href="tel:+1-800-EXAMPLE" className="text-blue-600 hover:text-blue-800 ml-1">+1 (800) 123-4567</a>
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
            <a href="/privacy" className="ml-3 hover:text-gray-600">Privacy Policy</a>
            <span className="mx-2">•</span>
            <a href="/terms" className="hover:text-gray-600">Terms of Service</a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}