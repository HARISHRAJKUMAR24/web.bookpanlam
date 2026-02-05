"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlanUpgradeStatus } from "@/lib/api/plans";

interface Plan {
  id: number;
  name: string;
  amount: number;
  display_price: number;
  previous_display_price?: number;
  duration: number;
  description?: string;
  feature_lists: string[];
  is_trial: boolean;
  gst_type?: string;
  [key: string]: any;
}

interface CurrencySettings {
  currency: string;
  currency_symbol: string;
}

interface PlanStatus {
  plan_id: number;
  plan_name: string;
  plan_duration: number;
  plan_duration_display: string;
  plan_final_price: number;
  button_status: 'current' | 'upgrade' | 'downgrade' | 'available' | 'expired';
  button_text: string;
  is_disabled: boolean;
}

interface UpgradePlansProps {
  initialPlans: Plan[];
  initialCurrencySettings: CurrencySettings;
  userId: string | null;
}

export default function UpgradePlans({
  initialPlans,
  initialCurrencySettings,
  userId
}: UpgradePlansProps) {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>(initialPlans || []);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [duration, setDuration] = useState("yearly");
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    initialCurrencySettings || { currency: 'INR', currency_symbol: '₹' }
  );
  const [planStatuses, setPlanStatuses] = useState<PlanStatus[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirectingPlanId, setRedirectingPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (!initialPlans) return;

    setPlans(initialPlans);
    filterPlansByDuration(initialPlans, "yearly");

    if (initialCurrencySettings) {
      setCurrencySettings(initialCurrencySettings);
    }

    // Fetch plan upgrade status
    fetchPlanUpgradeStatus();
  }, [initialPlans, initialCurrencySettings, userId]);

  const fetchPlanUpgradeStatus = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await getPlanUpgradeStatus(userId);

      if (response.success) {
        setPlanStatuses(response.plan_statuses || []);
        setCurrentPlan(response.user_data || null);
      }
    } catch (error) {
      console.error("Error fetching plan status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanType = (durationDays: number) => {
    const isMonthly = durationDays % 30 === 0 && durationDays % 365 !== 0;
    const isYearly = durationDays % 365 === 0;

    if (isMonthly) return "monthly";
    if (isYearly) return "yearly";
    return "other";
  };

  const filterPlansByDuration = (allPlans: Plan[], selectedDuration: string) => {
    if (!allPlans || !Array.isArray(allPlans)) return;

    const filtered = allPlans.filter(
      (plan) => getPlanType(plan.duration) === selectedDuration
    );

    setFilteredPlans(filtered);
  };

  const handleDurationChange = (selectedDuration: string) => {
    setDuration(selectedDuration);
    filterPlansByDuration(plans, selectedDuration);
  };

  const formatDuration = (days: number) => {
    if (!days || days <= 0) return "N/A";

    // Check for exact durations
    if (days === 365) return "1 Year";
    if (days === 730) return "2 Years";
    if (days === 1095) return "3 Years";
    if (days === 30) return "1 Month";
    if (days === 60) return "2 Months";
    if (days === 90) return "3 Months";
    if (days === 180) return "6 Months";

    // For other durations
    if (days < 30) return `${days} Days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} Months`;
    }

    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays > 0) {
      const remainingMonths = Math.floor(remainingDays / 30);
      return `${years} Years, ${remainingMonths} Months`;
    }
    return `${years} Years`;
  };

  const formatCurrency = (amount: number) => {
    return Math.round(amount).toLocaleString("en-IN");
  };

  const formatPrice = (amount: number) => {
    const formattedAmount = formatCurrency(amount);
    return `${currencySettings.currency_symbol}${formattedAmount}`;
  };

  const calculateDiscountPercentage = (
    currentPrice: number,
    previousPrice?: number
  ) => {
    if (!previousPrice || previousPrice <= currentPrice) return 0;
    return Math.round(((previousPrice - currentPrice) / previousPrice) * 100);
  };

  const calculateSavingsAmount = (
    currentPrice: number,
    previousPrice?: number
  ) => {
    if (!previousPrice || previousPrice <= currentPrice) return 0;
    return previousPrice - currentPrice;
  };

  const formatSavingsAmount = (amount: number) => {
    return `${currencySettings.currency_symbol}${formatCurrency(amount)}`;
  };

  const getPlanStatus = (planId: number) => {
    if (!planStatuses.length) return null;
    return planStatuses.find(status => status.plan_id === planId);
  };

  const getButtonConfig = (planId: number, isTrial: boolean, planType: string) => {
    const status = getPlanStatus(planId);

    if (!status) {
      // Default configuration if no status found
      return {
        text: isTrial ? "Start Free Trial" : `Choose ${planType === "monthly" ? "Monthly" : "Yearly"} Plan`,
        disabled: false,
        className: isTrial
          ? "bg-white text-blue-700 hover:bg-gray-50"
          : planType === "monthly"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-green-600 text-white hover:bg-green-700"
      };
    }

    const { button_status, button_text, is_disabled } = status;

    // Define button styles based on status
    let buttonClassName = "";

    switch (button_status) {
      case 'current':
        buttonClassName = "bg-purple-600 text-white hover:bg-purple-700";
        break;
      case 'upgrade':
        buttonClassName = "bg-green-600 text-white hover:bg-green-700";
        break;
      case 'downgrade':
        buttonClassName = "bg-gray-400 text-white cursor-not-allowed";
        break;
      case 'expired':
        // ✅ EXPIRED PLAN BUTTON - GREEN COLOR (not red)
        buttonClassName = "bg-green-600 text-white hover:bg-green-700";
        break;
      case 'available':
      default:
        if (isTrial) {
          buttonClassName = "bg-white text-blue-700 hover:bg-gray-50";
        } else {
          buttonClassName = planType === "monthly"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-green-600 text-white hover:bg-green-700";
        }
        break;
    }

    return {
      text: button_text,
      disabled: is_disabled,
      className: buttonClassName
    };
  };

  const handlePlanSelect = (planId: number) => {
    const status = getPlanStatus(planId);

    // 🚫 BLOCK DOWNGRADE COMPLETELY
    if (status?.button_status === 'downgrade') {
      const currentPlanName = currentPlan?.current_plan_name || "your current plan";
      alert(`You cannot downgrade from ${currentPlanName}. Please choose an upgrade or renewal.`);
      return;
    }

    setRedirectingPlanId(planId);

    setTimeout(() => {
      router.push(`/checkout?plan_id=${planId}`);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-4 sm:px-5">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-3">
        Upgrade Your Plan
      </h1>

     
      {/* Current Plan Info with Expiry Status */}
{currentPlan && currentPlan.current_plan_name !== 'No Plan' && (
  <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg ${
        currentPlan.plan_expired
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      } text-white`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Your Current Plan</h3>
          <p className="text-base sm:text-lg font-semibold">
            {currentPlan.current_plan_name}
          </p>

          {/* Expiry message only */}
          {currentPlan.expiry_message && (
            <p
              className={`text-sm sm:text-base font-semibold mt-2 sm:mt-3 ${
                currentPlan.plan_expired
                  ? 'bg-red-900/70 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block text-xs sm:text-sm'
                  : currentPlan.plan_status === 'expiring_soon'
                    ? 'bg-amber-900/60 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block text-xs sm:text-sm'
                    : 'text-white'
              }`}
            >
              {currentPlan.plan_status === 'active'
                ? `Expires on ${currentPlan.expires_on_date}`
                : currentPlan.expiry_message}
            </p>
          )}
        </div>

        <div className="mt-3 sm:mt-4 md:mt-0 text-right">
          {currentPlan.plan_expired ? (
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">Plan Expired</div>
              <p className="text-red-100 text-xs sm:text-sm mt-1">
                Please renew to continue
              </p>
            </div>
          ) : (
            <>
              <p className="text-xl sm:text-2xl font-bold">
                {formatPrice(currentPlan.current_plan_final_price)}
              </p>
              <p className="text-blue-100 text-xs sm:text-sm">
                Total (incl. GST)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}


      <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto px-4">
        {currentPlan?.current_plan_name === 'No Plan'
          ? "Choose the perfect plan to unlock more powerful features."
          : currentPlan?.plan_expired
            ? "Your plan has expired. Please renew to continue using all features."
            : "You can only upgrade to higher-priced plans or renew your current plan."}
      </p>

      {/* Toggle */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="bg-white border rounded-full p-1 flex gap-1 sm:gap-2 shadow-sm">
          <button
            onClick={() => handleDurationChange("monthly")}
            className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${duration === "monthly"
              ? "bg-blue-600 text-white"
              : "text-gray-600"
              }`}
          >
            Monthly Plans
          </button>

          <button
            onClick={() => handleDurationChange("yearly")}
            className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition ${duration === "yearly"
              ? "bg-blue-600 text-white"
              : "text-gray-600"
              }`}
          >
            Yearly Plans
          </button>
        </div>
      </div>

      {/* No Plans */}
      {filteredPlans.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-8 sm:py-12 px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📭</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
              No {duration} plans available
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              We don't have any {duration} subscription plans right now.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4">
        {filteredPlans.map((p, i) => {
          const features = Array.isArray(p.feature_lists)
            ? p.feature_lists
            : [];
          const planType = getPlanType(p.duration);
          const formattedDuration = formatDuration(p.duration);
          const planStatus = getPlanStatus(p.id);

          const discountPercentage = calculateDiscountPercentage(
            p.display_price,
            p.previous_display_price
          );
          const savingsAmount = calculateSavingsAmount(
            p.display_price,
            p.previous_display_price
          );
          const shouldShowDiscount = discountPercentage > 0;

          const buttonConfig = getButtonConfig(p.id, p.is_trial, planType);

          // Check if this is the expired plan
          const isExpiredPlan = currentPlan?.plan_expired && 
                                currentPlan.current_plan_id === p.id && 
                                planStatus?.button_status === 'expired';

          return (
            <div
              key={i}
              className={`relative p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 ${p.is_trial
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500"
                : planType === "monthly"
                  ? "bg-white border-blue-100"
                  : "bg-white border-green-100"
                } ${isExpiredPlan ? 'ring-2 ring-red-500' : ''}`}
            >
              {/* Expired Plan Badge - RED */}
              {isExpiredPlan && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-600 text-white text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1 rounded-full font-semibold shadow">
                    Plan Expired
                  </span>
                </div>
              )}

              {/* Current Plan Badge - PURPLE */}
              {planStatus?.button_status === 'current' && !currentPlan?.plan_expired && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1 rounded-full font-semibold shadow">
                    Your Current Plan
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-left mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{p.name}</h2>

                {shouldShowDiscount && (
                  <div className="mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold">
                      {discountPercentage}% OFF
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">
                      Save {formatSavingsAmount(savingsAmount)}
                    </span>
                  </div>
                )}

                {/* Prices */}
                <div className="text-left mb-3 sm:mb-4">
                  <div className="flex items-baseline gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                    {shouldShowDiscount && p.previous_display_price && (
                      <span className={`text-sm sm:text-lg line-through ${p.is_trial ? 'text-blue-200' : 'text-gray-400'}`}>
                        {formatPrice(p.previous_display_price)}
                      </span>
                    )}
                    <span
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold ${p.is_trial ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {formatPrice(p.display_price)}
                    </span>
                    <span
                      className={`text-sm sm:text-lg ${p.is_trial ? "text-blue-100" : "text-gray-600"
                        }`}
                    >
                      /{formattedDuration}
                    </span>
                  </div>

                  {p.description && (
                    <p
                      className={`text-xs sm:text-sm ${p.is_trial ? "text-blue-100" : "text-gray-600"
                        } mb-3 sm:mb-4`}
                    >
                      {p.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-4 sm:pt-6 mb-6 sm:mb-8">
                <h4
                  className={`text-xs sm:text-sm font-semibold mb-3 sm:mb-4 uppercase tracking-wider ${p.is_trial ? "text-white" : "text-gray-700"
                    }`}
                >
                  What's included:
                </h4>

                <div className="space-y-2 sm:space-y-3">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center mt-0.5 ${p.is_trial
                          ? "bg-blue-500"
                          : planType === "monthly"
                            ? "bg-blue-100"
                            : "bg-green-100"
                          }`}
                      >
                        <span
                          className={`text-xs ${p.is_trial
                            ? "text-white"
                            : planType === "monthly"
                              ? "text-blue-600"
                              : "text-green-600"
                            }`}
                        >
                          ✓
                        </span>
                      </div>

                      <span
                        className={`text-xs sm:text-sm ${p.is_trial ? "text-blue-100" : "text-gray-600"
                          }`}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(p.id)}
                disabled={
                  buttonConfig.disabled ||
                  redirectingPlanId !== null ||
                  planStatus?.button_status === "downgrade"
                }
                className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 shadow hover:shadow-lg flex items-center justify-center gap-2
                  ${buttonConfig.className}
                  ${(buttonConfig.disabled || redirectingPlanId !== null) ? 'cursor-not-allowed opacity-70' : ''}
                `}
              >
                {redirectingPlanId === p.id ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Loading...
                  </>
                ) : (
                  buttonConfig.text
                )}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}