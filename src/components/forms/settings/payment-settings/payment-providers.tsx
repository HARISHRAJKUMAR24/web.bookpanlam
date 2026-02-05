"use client";

import React, { useEffect, useState } from "react";
import PaymentMethodCard from "@/components/cards/payment-method-card";
import { InputField, siteSettings } from "@/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getPaymentSettings } from "@/lib/api/site-settings";

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
     FETCH FROM DB (ON REFRESH)
  =============================== */

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getPaymentSettings();

      console.log("✅ RAW API RESPONSE:", res);
      console.log("✅ RESPONSE.DATA:", res?.data);
    };

    fetchSettings();
  }, []);


  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getPaymentSettings();
      console.log("🔥 DB SETTINGS:", res);

      if (res?.success && res.data) {
        setSettings(res.data);
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
     HELPERS
  =============================== */
  const hasRazorpayData =
    !!razorpayKeyId || !!razorpaySecretKey;

  /* ===============================
     INPUT FIELDS
  =============================== */
  const razorpayInputFields: Form = {
    razorpayKeyId: {
      type: "text",
      value: razorpayKeyId,
      setValue: setRazorpayKeyId,
      label: "Key ID",
      placeholder: "rzp_test_...",
      description: "Your Razorpay API Key ID",
      required: true,
    },
    razorpaySecretKey: {
      type: "password",
      value: razorpaySecretKey,
      setValue: setRazorpaySecretKey,
      label: "Secret Key",
      placeholder: "Enter your secret key",
      description: "Keep this secure and never share it",
      required: true,
    },
  };

  const phonepeInputFields: Form = {
    phonepeSaltKey: {
      type: "text",
      value: phonepeSaltKey,
      setValue: setPhonepeSaltKey,
      label: "Salt Key",
      placeholder: "Enter salt key",
      required: true,
    },
    phonepeSaltIndex: {
      type: "text",
      value: phonepeSaltIndex,
      setValue: setPhonepeSaltIndex,
      label: "Salt Index",
      placeholder: "1",
      required: true,
    },
    phonepeMerchantId: {
      type: "text",
      value: phonepeMerchantId,
      setValue: setPhonepeMerchantId,
      label: "Merchant ID",
      placeholder: "MERCHANTUAT",
      required: true,
    },
  };

  const payuInputFields: Form = {
    payuApiKey: {
      type: "text",
      value: payuApiKey,
      setValue: setPayuApiKey,
      label: "API Key",
      placeholder: "gtKFFx",
      required: true,
    },
    payuSalt: {
      type: "text",
      value: payuSalt,
      setValue: setPayuSalt,
      label: "Salt",
      placeholder: "eCwWELxi",
      required: true,
    },
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Razorpay */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Razorpay Configuration
          </h3>

          <PaymentMethodCard
            name="razorpayEnabled"
            value={{ value: razorpayEnabled, setValue: setRazorpayEnabled }}
            method={{ name: "Razorpay", icon: "razorpay.png" }}
            inputFields={razorpayInputFields}
          />

        </div>

        {/* PayU */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-5 w-5 text-green-600" />
            PayU Configuration
          </h3>

          <PaymentMethodCard
            name="payuEnabled"
            value={{ value: payuEnabled, setValue: setPayuEnabled }}
            method={{ name: "PayU", icon: "payu.png" }}
            inputFields={payuInputFields}
          />

        </div>

        {/* PhonePe */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Smartphone className="h-5 w-5 text-purple-600" />
            PhonePe Configuration
          </h3>

          <PaymentMethodCard
            name="phonepeEnabled"
            value={{ value: phonepeEnabled, setValue: setPhonepeEnabled }}
            method={{ name: "PhonePe", icon: "phonepe.png" }}
            inputFields={phonepeInputFields}
          />

        </div>

        {/* Cash */}
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <Wallet className="h-5 w-5 text-amber-600" />
            Cash Payment
          </h3>

          <PaymentMethodCard
            name="cashInHand"
            value={{ value: cashInHand, setValue: setCashInHand }}
            method={{ name: "Cash In Hand", icon: "cash.png" }}
            inputFields={{}}   // 🔥 REQUIRED
          />

        </div>
      </div>
    </div>
  );
};

export default PaymentProviders;
