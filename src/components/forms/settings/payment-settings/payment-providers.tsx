"use client";

import React, { useEffect, useState } from "react";
import PaymentMethodCard from "@/components/cards/payment-method-card";
import { InputField, siteSettings } from "@/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getPaymentSettings, updateSiteSettings } from "@/lib/api/site-settings";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { CreditCard, Smartphone, Wallet } from "lucide-react";

interface Form {
  [key: string]: InputField;
}

const PaymentProviders = () => {
  const { userData } = useCurrentUser();

  /* ===============================
     DB SETTINGS (SOURCE OF TRUTH)
  =============================== */
  const [settings, setSettings] = useState<siteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  /* ===============================
     RAZORPAY
  =============================== */
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpaySecretKey, setRazorpaySecretKey] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  /* ===============================
     PHONEPE
  =============================== */
  const [phonepeSaltKey, setPhonepeSaltKey] = useState("");
  const [phonepeSaltIndex, setPhonepeSaltIndex] = useState("");
  const [phonepeMerchantId, setPhonepeMerchantId] = useState("");
  const [phonepeEnabled, setPhonepeEnabled] = useState(false);

  /* ===============================
     PAYU
  =============================== */
  const [payuApiKey, setPayuApiKey] = useState("");
  const [payuSalt, setPayuSalt] = useState("");
  const [payuEnabled, setPayuEnabled] = useState(false);

  /* ===============================
     CASH
  =============================== */
  const [cashInHand, setCashInHand] = useState(false);

  /* ===============================
     FETCH FROM DB
  =============================== */
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getPaymentSettings();
      console.log("🔥 DB SETTINGS:", res);

      if (res?.success && res.data) {
        setSettings(res.data);
        setHasChanges(false);
      }
    };

    fetchSettings();
  }, []);

  /* ===============================
     HYDRATE STATES FROM DB
  =============================== */
  useEffect(() => {
    if (!settings) return;

    // Cash
    setCashInHand(Boolean(settings.cashInHand));

    // Razorpay
    setRazorpayKeyId(settings.razorpayKeyId || "");
    setRazorpaySecretKey(settings.razorpaySecretKey || "");
    setRazorpayEnabled(
      Boolean(settings.razorpayKeyId || settings.razorpaySecretKey)
    );

    // PhonePe
    setPhonepeSaltKey(settings.phonepeSaltKey || "");
    setPhonepeSaltIndex(settings.phonepeSaltIndex || "");
    setPhonepeMerchantId(settings.phonepeMerchantId || "");
    setPhonepeEnabled(
      Boolean(settings.phonepeSaltKey || settings.phonepeMerchantId)
    );

    // PayU
    setPayuApiKey(settings.payuApiKey || "");
    setPayuSalt(settings.payuSalt || "");
    setPayuEnabled(Boolean(settings.payuApiKey || settings.payuSalt));
  }, [settings]);

  /* ===============================
     DETECT CHANGES
  =============================== */
  useEffect(() => {
    if (!settings) return;

    const currentData = {
      cashInHand: Boolean(settings.cashInHand),
      razorpayKeyId: settings.razorpayKeyId || "",
      razorpaySecretKey: settings.razorpaySecretKey || "",
      phonepeSaltKey: settings.phonepeSaltKey || "",
      phonepeSaltIndex: settings.phonepeSaltIndex || "",
      phonepeMerchantId: settings.phonepeMerchantId || "",
      payuApiKey: settings.payuApiKey || "",
      payuSalt: settings.payuSalt || "",
    };

    const newData = {
      cashInHand,
      razorpayKeyId,
      razorpaySecretKey,
      phonepeSaltKey,
      phonepeSaltIndex,
      phonepeMerchantId,
      payuApiKey,
      payuSalt,
    };

    const hasChangesDetected = JSON.stringify(currentData) !== JSON.stringify(newData);
    setHasChanges(hasChangesDetected);
  }, [
    cashInHand,
    razorpayKeyId,
    razorpaySecretKey,
    phonepeSaltKey,
    phonepeSaltIndex,
    phonepeMerchantId,
    payuApiKey,
    payuSalt,
    settings
  ]);

  /* ===============================
     INPUT FIELDS
  =============================== */
  const razorpayInputFields: Form = {
    razorpayKeyId: {
      type: "text",
      value: razorpayKeyId,
      setValue: (val) => {
        setRazorpayKeyId(val);
      },
      label: "Key ID",
      placeholder: "rzp_test_...",
      required: true,
    },
    razorpaySecretKey: {
      type: "password",
      value: razorpaySecretKey,
      setValue: (val) => {
        setRazorpaySecretKey(val);
      },
      label: "Secret Key",
      placeholder: "Enter your secret key",
      required: true,
    },
  };

  const phonepeInputFields: Form = {
    phonepeSaltKey: {
      type: "text",
      value: phonepeSaltKey,
      setValue: (val) => {
        setPhonepeSaltKey(val);
      },
      label: "Salt Key",
      placeholder: "Enter salt key",
      required: true,
    },
    phonepeSaltIndex: {
      type: "text",
      value: phonepeSaltIndex,
      setValue: (val) => {
        setPhonepeSaltIndex(val);
      },
      label: "Salt Index",
      placeholder: "1",
      required: true,
    },
    phonepeMerchantId: {
      type: "text",
      value: phonepeMerchantId,
      setValue: (val) => {
        setPhonepeMerchantId(val);
      },
      label: "Merchant ID",
      placeholder: "MERCHANTUAT",
      required: true,
    },
  };

  const payuInputFields: Form = {
    payuApiKey: {
      type: "text",
      value: payuApiKey,
      setValue: (val) => {
        setPayuApiKey(val);
      },
      label: "API Key",
      placeholder: "gtKFFx",
      required: true,
    },
    payuSalt: {
      type: "text",
      value: payuSalt,
      setValue: (val) => {
        setPayuSalt(val);
      },
      label: "Salt",
      placeholder: "eCwWELxi",
      required: true,
    },
  };

  /* ===============================
     SAVE ALL SETTINGS
  =============================== */
  const handleSaveAll = async () => {
    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    setIsSaving(true);

    const payload = {
      cashInHand: cashInHand ? 1 : 0,
      razorpayKeyId,
      razorpaySecretKey,
      phonepeSaltKey,
      phonepeSaltIndex,
      phonepeMerchantId,
      payuApiKey,
      payuSalt,
    };

    console.log("📦 SAVING ALL PAYMENT SETTINGS:", payload);

    try {
      const response = await updateSiteSettings(payload);

      if (response?.success) {
        toast.success("Payment settings saved successfully");

        // Update local settings state to reflect saved changes
        setSettings(prev => prev ? {
          ...prev,
          ...payload,
          cashInHand: Boolean(payload.cashInHand)
        } : null);

        setHasChanges(false);
      } else {
        toast.error(response?.message || "Failed to save settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Providers</h1>
        <p className="text-gray-500 mt-1">
          Configure your payment gateway settings
        </p>
      </div>

      {/* Payment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Razorpay */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Razorpay Configuration
          </h3>

          <PaymentMethodCard
            name="razorpay"
            method={{ name: "Razorpay", icon: "razorpay.png" }}
            inputFields={razorpayInputFields}
            showEnableSwitch={false}
          />
        </div>

        {/* PayU */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <CreditCard className="h-5 w-5 text-green-600" />
            PayU Configuration
          </h3>

          <PaymentMethodCard
            name="payu"
            method={{ name: "PayU", icon: "payu.png" }}
            inputFields={payuInputFields}
            showEnableSwitch={false}
          />
        </div>

        {/* PhonePe */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Smartphone className="h-5 w-5 text-purple-600" />
            PhonePe Configuration
          </h3>

          <PaymentMethodCard
            name="phonepe"
            method={{ name: "PhonePe", icon: "phonepe.png" }}
            inputFields={phonepeInputFields}
            showEnableSwitch={false}
          />
        </div>

        {/* Cash */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold mb-4">
            <Wallet className="h-5 w-5 text-amber-600" />
            Cash Payment
          </h3>

          <PaymentMethodCard
            name="cashInHand"
            method={{ name: "Cash In Hand", icon: "cash.png" }}
            inputFields={{}}
            showEnableSwitch={true}
            enabled={cashInHand}
            onToggle={(value) => setCashInHand(value)}
          />
        </div>
      </div>

      {/* Save All Button - Responsive positioning */}
      <div className="pt-6 border-t">
        <div className="flex justify-center lg:justify-end">
          <Button
            onClick={handleSaveAll}
            className="gap-2 w-full sm:w-auto"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProviders;