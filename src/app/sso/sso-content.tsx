"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SSOContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [message, setMessage] = useState("Verifying your credentials...");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing authentication token");
      setTimeout(() => window.location.replace("/login"), 2000);
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const login = async () => {
      try {
        const response = await fetch("/api/sso-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error("Authentication failed");
        }

        setStatus("success");
        setMessage("Login successful! Redirecting...");
        setTimeout(() => window.location.replace("/dashboard"), 800);

      } catch (err) {
        setStatus("error");
        setMessage("Authentication failed. Redirecting...");
        setTimeout(() => window.location.replace("/login"), 2000);
      }
    };

    login();
    return () => clearTimeout(timeoutId);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-6">

            <div className="relative">
              <div
                className={`w-20 h-20 rounded-full border-4 ${
                  status === "loading"
                    ? "border-indigo-100 border-t-indigo-600 animate-spin"
                    : status === "success"
                    ? "border-green-100 border-t-green-500"
                    : "border-red-100 border-t-red-500"
                }`}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                {status === "loading" ? (
                  <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
                ) : status === "success" ? (
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {status === "loading" ? "Signing you in" : status === "success" ? "Welcome back!" : "Authentication failed"}
              </h2>
              <p className="text-gray-600">{message}</p>
            </div>

            {status === "loading" && (
              <div className="w-full pt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full animate-progress"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble?{" "}
            <button
              onClick={() => window.location.replace("/login")}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Try manual login
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
          width: 50%;
        }
      `}</style>
    </div>
  );
}
