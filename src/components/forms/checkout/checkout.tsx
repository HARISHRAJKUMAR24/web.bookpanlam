"use client";

import { useState, useEffect, useRef } from "react";
import { validateDiscount } from "@/lib/api/plans";
import {
    getRazorpayCredentials,
    createRazorpayOrder,
    verifyRazorpayPayment,
    loadRazorpayScript
} from "@/lib/api/razorpay";
import { checkDowngradeEligibility, getLastBillingAddress } from "@/lib/api/checkout";
import { toast } from "sonner";
import { COUNTRIES } from "@/constants";
import {
    getPayUCredentials,
    createPayUOrder,
    verifyPayUPayment,
    loadPayUScript,
    type PayUOrderResponse
} from "@/lib/api/payu";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutProps {
    plan: any;
    gst: any;
    user?: any;
    currencySettings?: {
        currency: string;
        currency_symbol: string;
    };
    companySettings?: {
        app_name: string;
        address: string;
        gst_number?: string;
    };
}

export default function Checkout({ plan, gst, user, currencySettings, companySettings }: CheckoutProps) {
    const defaultCurrency = currencySettings || { currency: 'INR', currency_symbol: '₹' };
    const defaultCompany = companySettings || { app_name: 'Book Pannu', address: '' };

    // Helper function to format currency with symbol
    const formatCurrency = (num: number) => {
        return Math.round(num || 0).toLocaleString("en-IN");
    };

    // Function to format price with currency symbol
    const formatPrice = (amount: number) => {
        const formattedAmount = formatCurrency(amount);
        return `${defaultCurrency.currency_symbol}${formattedAmount}`;
    };

    // State for discount
    const [discountCode, setDiscountCode] = useState("");
    const [discount, setDiscount] = useState({ amount: 0, type: null, applied: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);

    // State for GSTIN
    const [showGstinField, setShowGstinField] = useState(false);
    const [gstinNumber, setGstinNumber] = useState("");
    const [gstinError, setGstinError] = useState("");

    // State for billing info
    const [billingInfo, setBillingInfo] = useState({
        name: "",
        phone: "",
        email: "",
        pin_code: "",
        address_1: "",
        address_2: "",
        state: "",
        city: "",
        country: "India"
    });

    useEffect(() => {
        if (!user?.user_id) return;

        const fetchLastBilling = async () => {
            try {
                const res = await getLastBillingAddress(user.user_id);

                if (!res?.success || !res?.data) return;

                const data = res.data;  // TS now knows it's defined!

                setBillingInfo(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                    address_1: data.address_1 || "",
                    address_2: data.address_2 || "",
                    city: data.city || "",
                    state: data.state || "",
                    pin_code: data.pin_code || "",
                    country: data.country || "India"
                }));

                if (data.gst_number) {
                    setShowGstinField(true);
                    setGstinNumber(data.gst_number);
                }

            } catch (err) {
                console.warn("No previous billing info found");
            }
        };

        fetchLastBilling();
    }, [user?.user_id]);


    // State for postal code lookup
    const [postalCodeLoading, setPostalCodeLoading] = useState(false);
    const [postalCodeError, setPostalCodeError] = useState("");

    // Add new state for downgrade check
    const [downgradeCheck, setDowngradeCheck] = useState<any>(null);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    // State for Razorpay script loading
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    // State for PayU form
    const [payuFormData, setPayuFormData] = useState<PayUOrderResponse | null>(null);
    const [processingPayU, setProcessingPayU] = useState(false);

    // Add a ref for form submission
    const formRef = useRef<HTMLFormElement>(null);

    // Load Razorpay script on component mount
    useEffect(() => {
        const preloadRazorpayScript = async () => {
            try {
                if (plan?.payment_gateways?.razorpay) {
                    await loadRazorpayScript();
                    setRazorpayLoaded(true);
                }
            } catch (error) {
                // Don't show error here, will load on demand
            }
        };

        preloadRazorpayScript();
    }, [plan]);

    // Load user data if available
    useEffect(() => {
        if (user) {
            setBillingInfo(prev => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                country: user.country || "India"
            }));
        }
    }, [user]);

    // Check downgrade eligibility on component mount
    useEffect(() => {
        if (user?.user_id && plan?.id) {
            checkPlanEligibility();
        }
    }, [user, plan]);

    // Auto-submit PayU form when data is ready
    useEffect(() => {
        if (payuFormData && formRef.current) {
            // Small delay to ensure form is rendered
            setTimeout(() => {
                formRef.current?.submit();
            }, 50);
        }
    }, [payuFormData]);

    const checkPlanEligibility = async () => {
        if (!user?.user_id || !plan?.id) return;

        setCheckingEligibility(true);
        try {
            const result = await checkDowngradeEligibility(user.user_id, plan.id);
            setDowngradeCheck(result);
        } catch (error) {
            // Error handled silently
        } finally {
            setCheckingEligibility(false);
        }
    };

    // State for country dropdown
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [countrySearch, setCountrySearch] = useState("");
    const countryDropdownRef = useRef<HTMLDivElement>(null);

    // Filter countries based on search
    const filteredCountries = COUNTRIES.filter(country =>
        country.label.toLowerCase().includes(countrySearch.toLowerCase())
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
                setShowCountryDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle country selection
    const handleCountrySelect = (countryName: string) => {
        setBillingInfo(prev => ({
            ...prev,
            country: countryName
        }));
        setShowCountryDropdown(false);
        setCountrySearch("");
    };

    // Handle postal code lookup (for Indian postal codes)
    const handlePostalCodeLookup = async () => {
        const postalCode = billingInfo.pin_code.trim();

        // Reset previous error
        setPostalCodeError("");

        // Only lookup for Indian 6-digit postal codes
        if (postalCode.length === 6 && /^\d{6}$/.test(postalCode)) {
            setPostalCodeLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${postalCode}`);
                const data = await response.json();

                if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const postOffice = data[0].PostOffice[0];

                    setBillingInfo(prev => ({
                        ...prev,
                        state: postOffice.State,
                        city: postOffice.District,
                        address_1: postOffice.Name,
                        country: "India"
                    }));
                } else {
                    setPostalCodeError("No postal code found. Please enter a valid 6-digit Indian postal code.");
                }
            } catch (error) {
                setPostalCodeError("Unable to fetch postal code details. Please enter address manually.");
            } finally {
                setPostalCodeLoading(false);
            }
        } else if (postalCode.length > 0) {
            setPostalCodeError("Please enter a valid 6-digit postal code.");
        }
    };

    // Trigger postal code lookup when pincode is entered
    useEffect(() => {
        if (billingInfo.pin_code.length === 6 && /^\d{6}$/.test(billingInfo.pin_code)) {
            const timer = setTimeout(() => {
                handlePostalCodeLookup();
            }, 1000);

            return () => clearTimeout(timer);
        } else if (billingInfo.pin_code.length > 0) {
            setBillingInfo(prev => ({
                ...prev,
                address_1: "",
                state: "",
                city: ""
            }));
            setPostalCodeError("");
        }
    }, [billingInfo.pin_code]);

    // Get GST percentage from API response
    const gstPercentage = gst?.gst_percentage || 18;

    // Check if GST is included in the plan price
    const isGstInclusive = plan?.is_price_inclusive || (gst?.gst_tax_type === 'inclusive');

    // Get payment gateway status from plan
    const paymentGateways = plan?.payment_gateways || {
        razorpay: false,
        phonepe: false,
        payu: false
    };

    // Get the actual amount from the plan (base price)
    const planAmount = plan?.amount || 0;

    // Get the display price (which might already include GST)
    const displayPrice = plan?.display_price || 0;

    let subTotal, gstAmount, finalTotal;

    if (isGstInclusive) {
        // If GST is already included in the price
        subTotal = planAmount;
        gstAmount = 0;
        finalTotal = displayPrice;
    } else {
        // If GST is exclusive
        subTotal = planAmount;
        gstAmount = Math.round((subTotal * gstPercentage) / 100);
        finalTotal = subTotal + gstAmount;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.applied && discount.type) {
        if (discount.type === 'percentage') {
            discountAmount = Math.round((subTotal * discount.amount) / 100);
        } else if (discount.type === 'fixed') {
            discountAmount = discount.amount;
        }
    }

    // Apply discount to final total
    const discountedTotal = finalTotal - discountAmount;

    // Handle discount code redemption
    const handleRedeemDiscount = async () => {
        if (!discountCode.trim()) {
            setError("Please enter a discount code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await validateDiscount(discountCode, plan?.id);

            if (result.success) {
                setDiscount({
                    amount: result.discount.amount,
                    type: result.discount.type,
                    applied: true
                });
                setError("");
                toast.success("Discount applied successfully!");
            } else {
                setError(result.message || "Invalid discount code");
                setDiscount({ amount: 0, type: null, applied: false });
                toast.error(result.message || "Invalid discount code");
            }
        } catch (err) {
            setError("Error applying discount code");
            setDiscount({ amount: 0, type: null, applied: false });
            toast.error("Error applying discount code");
        } finally {
            setLoading(false);
        }
    };

    // Validate GSTIN format
    const validateGSTIN = (gstin: string) => {
        if (!gstin) return true;

        // Basic GSTIN validation
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        if (gstin.length !== 15) {
            setGstinError("GSTIN must be exactly 15 characters");
            return false;
        }

        if (!gstinRegex.test(gstin)) {
            setGstinError("Invalid GSTIN");
            return false;
        }

        setGstinError("");
        return true;
    };

    // Handle GSTIN input change with validation
    const handleGstinChange = (value: string) => {
        setGstinNumber(value);

        if (value.length === 15) {
            validateGSTIN(value);
        }
    };

    // Handle billing info change
    const handleBillingInfoChange = (field: string, value: string) => {
        setBillingInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validate all required billing fields
    const validateBillingInfo = () => {
        const requiredFields = ['name', 'phone', 'pin_code', 'address_1', 'state', 'city'];

        for (const field of requiredFields) {
            if (!billingInfo[field as keyof typeof billingInfo]?.trim()) {
                toast.error(`Please fill in ${field.replace('_', ' ')}`);
                return false;
            }
        }

        // Validate phone number
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(billingInfo.phone)) {
            toast.error("Please enter a valid 10-digit Indian phone number");
            return false;
        }

        // Validate pincode
        const pincodeRegex = /^\d{6}$/;
        if (!pincodeRegex.test(billingInfo.pin_code)) {
            toast.error("Please enter a valid 6-digit PIN code");
            return false;
        }

        return true;
    };

    // Load Razorpay script with retry logic
    const loadRazorpayWithRetry = async (retryCount = 3): Promise<boolean> => {
        for (let i = 0; i < retryCount; i++) {
            try {
                await loadRazorpayScript();
                return true;
            } catch (error) {
                if (i < retryCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
                }
            }
        }
        return false;
    };

    // Handle Razorpay Payment
    const handleRazorpayPayment = async () => {
        // First check if this is a downgrade
        if (downgradeCheck?.is_downgrade) {
            toast.error(`You cannot downgrade from your ${downgradeCheck.current_plan_name}. Please choose an upgrade or same-priced plan.`);
            return;
        }

        // Validate billing info
        if (!validateBillingInfo()) {
            return;
        }

        setProcessingPayment(true);

        try {
            // Get Razorpay credentials
            const credentials = await getRazorpayCredentials();

            if (!credentials.razorpay_key_id) {
                toast.error("Razorpay credentials not configured. Please contact support.");
                setProcessingPayment(false);
                return;
            }

            // Create order using the extracted API function
            const orderData = await createRazorpayOrder({
                amount: discountedTotal,
                currency: defaultCurrency.currency,
                plan_id: plan.id,
                user_email: billingInfo.email,
                user_phone: billingInfo.phone
            });

            if (!orderData.success) {
                toast.error("Failed to create payment order: " + (orderData.message || "Unknown error"));
                setProcessingPayment(false);
                return;
            }

            const order = orderData.order;

            // Load Razorpay script if not already loaded
            let razorpayAvailable = razorpayLoaded;

            if (!razorpayAvailable) {
                try {
                    razorpayAvailable = await loadRazorpayWithRetry();
                } catch (error: any) {
                    toast.error("Failed to load payment gateway. Please check your internet connection and try again.");
                    setProcessingPayment(false);
                    return;
                }
            }

            // Check if Razorpay is available
            if (!window.Razorpay) {
                toast.error("Payment gateway not available. Please refresh the page or try a different payment method.");
                setProcessingPayment(false);
                return;
            }

            // Razorpay options
            const options = {
                key: credentials.razorpay_key_id,
                amount: order.amount,
                currency: order.currency,
                name: defaultCompany.app_name,
                description: `Payment for ${plan.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    const verificationData = await verifyRazorpayPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        logged_in_user_id: user?.user_id,
                        billing_data: {
                            ...billingInfo,
                            gstin: gstinNumber
                        },
                        plan_data: {
                            plan_id: plan.id,
                            amount: discountedTotal,
                            gst_amount: gstAmount,
                            gst_type: isGstInclusive ? 'inclusive' : 'exclusive',
                            gst_percentage: gstPercentage,
                            discount: discountAmount,
                            currency: defaultCurrency.currency,
                            currency_symbol: defaultCurrency.currency_symbol
                        }
                    });

                    if (verificationData.success) {
                        toast.success(`Payment successful! Invoice: ${verificationData.invoice_number}`);
                        const redirectUrl = verificationData.redirect_url || `/payment-success?invoice=${verificationData.invoice_number}`;
                        window.location.href = redirectUrl;
                    } else {
                        toast.error(verificationData.message || "Payment verification failed");
                        setProcessingPayment(false);
                    }
                },
                prefill: {
                    name: billingInfo.name,
                    email: billingInfo.email,
                    contact: billingInfo.phone
                },
                notes: {
                    plan: plan.name,
                    customer_email: billingInfo.email
                },
                theme: {
                    color: "#5f57ff"
                },
                modal: {
                    ondismiss: function () {
                        toast.info("Payment cancelled");
                        setProcessingPayment(false);
                    },
                    onclose: function () {
                        if (processingPayment) {
                            setProcessingPayment(false);
                        }
                    }
                }
            };

            // Initialize Razorpay
            const razorpay = new window.Razorpay(options);

            // Set up error handling
            razorpay.on('payment.failed', function (response: any) {
                toast.error("Payment failed: " + (response.error.description || "Unknown error"));
                setProcessingPayment(false);
            });

            razorpay.open();

        } catch (error: any) {
            toast.error("Payment processing failed: " + (error.message || "Unknown error"));
            setProcessingPayment(false);
        }
    };

    // Handle PhonePe Payment (stub function)
    const handlePhonePePayment = () => {
        if (downgradeCheck?.is_downgrade) {
            toast.error(`You cannot downgrade from your ${downgradeCheck.current_plan_name}. Please choose an upgrade or same-priced plan.`);
            return;
        }
        toast.info("PhonePe payment integration coming soon");
    };

    // Handle PayU Payment - USING SUBTOTAL
    // Handle PayU Payment - FIXED: Use same calculation as Razorpay
    const handlePayUPayment = async () => {
        // First check if this is a downgrade
        if (downgradeCheck?.is_downgrade) {
            toast.error(`You cannot downgrade from your ${downgradeCheck.current_plan_name}. Please choose an upgrade or same-priced plan.`);
            return;
        }

        // Validate billing info
        if (!validateBillingInfo()) {
            return;
        }

        setProcessingPayU(true);

        try {
            // Get PayU credentials
            const credentials = await getPayUCredentials();

            if (!credentials.payu_merchant_key || !credentials.payu_salt) {
                toast.error("PayU credentials not configured. Please contact support.");
                setProcessingPayU(false);
                return;
            }

            // FIX: Use the SAME amount calculation as Razorpay
            const payuAmount = discountedTotal; // Use discountedTotal, NOT subTotal

            // Debug logging
            console.log("PayU Amount Calculation:", {
                planAmount: planAmount,
                subTotal: subTotal,
                gstAmount: gstAmount,
                finalTotal: finalTotal,
                discountAmount: discountAmount,
                discountedTotal: discountedTotal,
                payuAmount: payuAmount
            });

            // Save data to localStorage for PayU callback pages
            localStorage.setItem('billingInfo', JSON.stringify({
                ...billingInfo,
                gstin: gstinNumber,
                user_id: user?.user_id
            }));

            localStorage.setItem('planData', JSON.stringify({
                plan_id: plan.id,
                amount: payuAmount, // Using discountedTotal (same as Razorpay)
                gst_amount: gstAmount,
                gst_type: isGstInclusive ? 'inclusive' : 'exclusive',
                gst_percentage: gstPercentage,
                discount: discountAmount,
                currency: defaultCurrency.currency,
                currency_symbol: defaultCurrency.currency_symbol,
                plan_name: plan.name
            }));

            // Create PayU order using discountedTotal
            const orderData = await createPayUOrder({
                amount: payuAmount, // Passing discountedTotal
                currency: defaultCurrency.currency,
                plan_id: plan.id,
                user_email: billingInfo.email,
                user_phone: billingInfo.phone,
                user_name: billingInfo.name,
                billing_data: {
                    ...billingInfo,
                    gstin: gstinNumber,
                    user_id: user?.user_id
                },
                plan_data: {
                    plan_id: plan.id,
                    amount: payuAmount, // Using discountedTotal
                    gst_amount: gstAmount,
                    gst_type: isGstInclusive ? 'inclusive' : 'exclusive',
                    gst_percentage: gstPercentage,
                    discount: discountAmount,
                    currency: defaultCurrency.currency,
                    currency_symbol: defaultCurrency.currency_symbol,
                    plan_name: plan.name
                }
            });

            console.log("PayU Order Data Received:", orderData);

            if (!orderData.success) {
                toast.error("Failed to create payment order: " + (orderData.message || "Unknown error"));
                setProcessingPayU(false);
                return;
            }

            // Store form data - the useEffect will auto-submit
            setPayuFormData(orderData);

        } catch (error: any) {
            console.error("PayU Payment Error:", error);
            toast.error("Payment processing failed: " + (error.message || "Unknown error"));
            setProcessingPayU(false);
        }
    };

    return (
        <div className="min-h-screen bg-white px-6 py-10">
            {/* Hidden PayU Form */}

            {payuFormData && (
                <form
                    ref={formRef}
                    id="payu-payment-form"
                    method="POST"
                    action={payuFormData.endpoint}
                    style={{ display: 'none' }}
                >
                    <input type="hidden" name="key" value={payuFormData.key} />
                    <input type="hidden" name="txnid" value={payuFormData.txnid} />
                    <input type="hidden" name="amount" value={payuFormData.amount} />
                    <input type="hidden" name="productinfo" value={payuFormData.productinfo} />
                    <input type="hidden" name="firstname" value={payuFormData.firstname} />
                    <input type="hidden" name="email" value={payuFormData.email} />
                    <input type="hidden" name="phone" value={payuFormData.phone} />
                    <input type="hidden" name="surl" value={payuFormData.surl} />
                    <input type="hidden" name="furl" value={payuFormData.furl} />
                    <input type="hidden" name="hash" value={payuFormData.hash} />
                    <input type="hidden" name="service_provider" value="payu" />

                    {/* Add currency field for foreign payments */}
                    <input type="hidden" name="currency" value={payuFormData.currency || defaultCurrency.currency} />

                    {/* ALL UDF FIELDS */}
                    <input type="hidden" name="udf1" value={payuFormData.udf1 || ""} />
                    <input type="hidden" name="udf2" value={payuFormData.udf2 || ""} />
                    <input type="hidden" name="udf3" value={payuFormData.udf3 || ""} />
                    <input type="hidden" name="udf4" value={payuFormData.udf4 || ""} />
                    <input type="hidden" name="udf5" value={payuFormData.udf5 || ""} />

                    {/* Additional fields */}
                    <input type="hidden" name="lastname" value="" />
                    <input type="hidden" name="address1" value={billingInfo.address_1} />
                    <input type="hidden" name="address2" value={billingInfo.address_2} />
                    <input type="hidden" name="city" value={billingInfo.city} />
                    <input type="hidden" name="state" value={billingInfo.state} />
                    <input type="hidden" name="country" value={billingInfo.country} />
                    <input type="hidden" name="zipcode" value={billingInfo.pin_code} />
                </form>
            )}

            {/* Add a warning banner if it's a downgrade */}
            {downgradeCheck?.is_downgrade && (
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 text-red-600 rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-700">Downgrade Not Allowed</h3>
                                <p className="text-red-600 text-sm">
                                    You are currently on the <span className="font-semibold">{downgradeCheck.current_plan_name}</span> plan.
                                    You cannot downgrade to lower-priced plans.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT FORM */}
                <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Billing Information</h2>

                    <div className="space-y-4">
                        <Input
                            label="Name or Company Name *"
                            value={billingInfo.name}
                            onChange={(e) => handleBillingInfoChange('name', e.target.value)}
                        />
                        <Input
                            label="Mobile Number *"
                            value={billingInfo.phone}
                            onChange={(e) => handleBillingInfoChange('phone', e.target.value)}
                            type="tel"
                        />
                        <Input
                            label="Email Address *"
                            value={billingInfo.email}
                            onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                            type="email"
                        />

                        {/* Postal Code with error message */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2 text-gray-700">Zip/Postal Code *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={billingInfo.pin_code}
                                    onChange={(e) => handleBillingInfoChange('pin_code', e.target.value)}
                                    onBlur={handlePostalCodeLookup}
                                    placeholder="Enter 6-digit postal code"
                                    maxLength={6}
                                />
                                {postalCodeLoading && (
                                    <div className="absolute right-3 top-3">
                                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Enter 6-digit postal code for auto-fill address
                            </div>
                            {/* Postal Code Error Message */}
                            {postalCodeError && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {postalCodeError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Address Line 1 *"
                            value={billingInfo.address_1}
                            onChange={(e) => handleBillingInfoChange('address_1', e.target.value)}
                            placeholder="Address will auto-fill from postal code"
                        />
                        <Input
                            label="Address Line 2"
                            value={billingInfo.address_2}
                            onChange={(e) => handleBillingInfoChange('address_2', e.target.value)}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                        <Input
                            label="State *"
                            value={billingInfo.state}
                            onChange={(e) => handleBillingInfoChange('state', e.target.value)}
                        />
                        <Input
                            label="City *"
                            value={billingInfo.city}
                            onChange={(e) => handleBillingInfoChange('city', e.target.value)}
                        />

                        {/* Country Select with Dropdown Search */}
                        <div className="flex flex-col" ref={countryDropdownRef}>
                            <label className="text-sm font-medium mb-2 text-gray-700">Country *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    value={billingInfo.country}
                                    onClick={() => setShowCountryDropdown(true)}
                                    onChange={(e) => {
                                        setBillingInfo(prev => ({ ...prev, country: e.target.value }));
                                        setShowCountryDropdown(true);
                                        setCountrySearch(e.target.value);
                                    }}
                                    placeholder="Select country"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Country Dropdown */}
                                {showCountryDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {/* Search Input */}
                                        <div className="sticky top-0 bg-white p-2 border-b">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Search countries..."
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Country List */}
                                        <div className="py-1">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((country) => (
                                                    <button
                                                        key={country.value}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                        onClick={() => handleCountrySelect(country.label)}
                                                    >
                                                        <span>{country.label}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm">No countries found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* GSTIN Section */}
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="showGstin"
                                checked={showGstinField}
                                onChange={(e) => setShowGstinField(e.target.checked)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <label
                                htmlFor="showGstin"
                                className="text-sm text-gray-600 cursor-pointer select-none"
                            >
                                Display my GSTIN number on invoice
                            </label>
                        </div>

                        {/* GSTIN Input Field */}
                        {showGstinField && (
                            <div className="pt-3 border-t">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-2 text-gray-700">
                                        GSTIN Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Enter 15-digit GSTIN"
                                            className={`border rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${gstinError ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            value={gstinNumber}
                                            onChange={(e) => handleGstinChange(e.target.value)}
                                            maxLength={15}
                                        />
                                    </div>

                                    {/* GSTIN Error Message */}
                                    {gstinError && (
                                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-red-600 text-sm flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {gstinError}
                                            </p>
                                        </div>
                                    )}

                                    {/* GSTIN Success Message */}
                                    {gstinNumber.length === 15 && !gstinError && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-green-600 text-sm flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                Valid GSTIN
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SUMMARY */}
                <div className="space-y-6">
                    {/* DISCOUNT SECTION */}
                    <div className="bg-white p-6 shadow-md rounded-xl">
                        <h2 className="text-lg font-semibold mb-4">Discount</h2>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter discount code"
                                className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleRedeemDiscount();
                                    }
                                }}
                            />
                            <button
                                className="bg-blue-600 text-white px-4 rounded-md disabled:bg-gray-400 min-w-[80px] hover:bg-blue-700 transition-colors"
                                onClick={handleRedeemDiscount}
                                disabled={loading || !discountCode.trim()}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : "Apply"}
                            </button>
                        </div>

                        {/* Error message only */}
                        {error && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 text-sm flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SUMMARY SECTION */}
                    <div className="bg-white p-6 shadow-md rounded-xl">
                        <h2 className="text-lg font-semibold mb-4">Summary</h2>

                        {/* Summary details */}
                        <Row label="Sub Total" value={formatPrice(subTotal)} />

                        {/* Discount row */}
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Discount</span>
                            <span className={discountAmount > 0 ? "text-green-600 font-medium" : "text-gray-600"}>
                                {discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}
                            </span>
                        </div>

                        {/* GST Info - Shows inclusive/exclusive */}
                        <div className="flex justify-between items-center py-2">
                            <div>
                                <span className="text-gray-600">GST ({gstPercentage}% {isGstInclusive ? "inclusive" : "exclusive"})</span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-800">{formatPrice(gstAmount)}</span>
                                {isGstInclusive && gstAmount === 0 && (
                                    <div className="text-xs text-gray-500">Included in price</div>
                                )}
                            </div>
                        </div>

                        {/* Separator line */}
                        <div className="border-t my-3 border-gray-200"></div>

                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-800 font-semibold text-lg">Total</span>
                            <span className="font-bold text-xl text-blue-700">{formatPrice(discountedTotal)}</span>
                        </div>
                    </div>

                    {/* PAYMENT SECTION */}
                    <div className="bg-white p-6 shadow-md rounded-xl">
                        <h2 className="text-lg font-semibold mb-4">Select Payment Method</h2>

                        <div className="space-y-3">
                            {/* Show checking status */}
                            {checkingEligibility && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {/* Razorpay Button with downgrade check */}
                            {paymentGateways.razorpay && !checkingEligibility && (
                                <button
                                    onClick={handleRazorpayPayment}
                                    disabled={processingPayment || (downgradeCheck?.is_disabled && downgradeCheck?.is_downgrade)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${downgradeCheck?.is_downgrade
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                                        } ${processingPayment ? "opacity-70 cursor-not-allowed" : ""}`}
                                    title={downgradeCheck?.is_downgrade ? downgradeCheck.message : ""}
                                >
                                    {processingPayment ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : downgradeCheck?.is_downgrade ? (
                                        `You are in ${downgradeCheck.current_plan_name}`
                                    ) : (
                                        `Pay  with Razorpay`
                                    )}
                                </button>
                            )}

                            {/* PhonePe Button with downgrade check */}
                            {paymentGateways.phonepe && !checkingEligibility && (
                                <button
                                    onClick={handlePhonePePayment}
                                    disabled={processingPayU || downgradeCheck?.is_downgrade}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg ${downgradeCheck?.is_downgrade
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
                                        } ${processingPayU ? "opacity-70 cursor-not-allowed" : ""}`}
                                    title={downgradeCheck?.is_downgrade ? "Downgrade not allowed" : ""}
                                >
                                    {downgradeCheck?.is_downgrade
                                        ? `You are in ${downgradeCheck.current_plan_name}`
                                        : `Pay ${formatPrice(discountedTotal)} with PhonePe`}
                                </button>
                            )}

                            {/* PayU Button with downgrade check - Using Subtotal */}
                            {/* PayU Button - FIXED: Show discountedTotal */}
                            {paymentGateways.payu && !checkingEligibility && (
                                <button
                                    onClick={handlePayUPayment}
                                    disabled={processingPayU || downgradeCheck?.is_downgrade}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${downgradeCheck?.is_downgrade
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                                        } ${processingPayU ? "opacity-70 cursor-not-allowed" : ""}`}
                                    title={downgradeCheck?.is_downgrade ? "Downgrade not allowed" : ""}
                                >
                                    {processingPayU ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : downgradeCheck?.is_downgrade ? (
                                        `You are in ${downgradeCheck.current_plan_name}`
                                    ) : (
                                        `Pay with PayU` // FIXED: Show discountedTotal
                                    )}
                                </button>
                            )}

                            {/* No payment methods available */}
                            {!paymentGateways.razorpay && !paymentGateways.phonepe && !paymentGateways.payu && !checkingEligibility && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-yellow-700 font-medium">No payment methods available for this plan</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment security note */}
                        {(paymentGateways.razorpay || paymentGateways.phonepe || paymentGateways.payu) && !downgradeCheck?.is_downgrade && (
                            <div className="mt-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Secure payment • SSL encrypted</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-400">
                                    You'll be redirected to secure payment gateway
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* UI Helpers */
function Input({
    label,
    value,
    onChange,
    type = "text",
    disabled = false,
    placeholder = "",
    helperText = "",
    onBlur
}: {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
    placeholder?: string;
    helperText?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
            <input
                type={type}
                className="border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                onBlur={onBlur}
            />
            {helperText && (
                <div className="mt-1 text-xs text-gray-500">{helperText}</div>
            )}
        </div>
    );
}

function Row({ label, value, bold }: any) {
    return (
        <div className="flex justify-between py-2">
            <span className="text-gray-600">{label}</span>
            <span className={bold ? "font-bold text-lg" : ""}>{value}</span>
        </div>
    );
}