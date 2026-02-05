"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import getSymbolFromCurrency from "currency-symbol-map";

import FormInputs from "@/components/form-inputs";
import { Button } from "@/components/ui/button";
import { COUNTRIES, CURRENCIES } from "@/constants";
import { statesByCountry } from "@/lib/api/csc";
import {
  getBasicSettings,
  updateBasicSettings,
} from "@/lib/api/basic-settings";
import { handleToast } from "@/lib/utils";
import { InputField, Option, User } from "@/types";

import LogoUpload from "./LogoUpload";
import FaviconUpload from "./FaviconUpload";

interface Props {
  initialData?: any;
  user: User;
}

interface Form {
  [key: string]: InputField;
}

const BasicSettings = ({ initialData, user }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(!initialData);

  const [currencies, setCurrencies] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);

  // =============================
  // INITIAL STATE (EMPTY)
  // =============================
  const [logo, setLogo] = useState("");
  const [favicon, setFavicon] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [currency, setCurrency] = useState("INR");
  const [country, setCountry] = useState("");
  const [state, setStateValue] = useState("");
  const [address, setAddress] = useState("");

  // =============================
  // SYNC FROM PROFILE (USER)
  // =============================
  useEffect(() => {
    if (user && !initialData) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setWhatsapp(user.phone || "");
      setCountry(user.country || "");
    }
  }, [user, initialData]);

  // =============================
  // FETCH BASIC SETTINGS (OVERRIDE)
  // =============================
  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await getBasicSettings();

      if (res?.success && res.data) {
        const d = res.data;

        setLogo(d.logo || "");
        setFavicon(d.favicon || "");
        setEmail(d.email || user?.email || "");
        setPhone(d.phone || user?.phone || "");
        setWhatsapp(d.whatsapp || user?.phone || "");
        setCurrency(d.currency || "INR");
        setCountry(d.country || user?.country || "");
        setStateValue(d.state || "");
        setAddress(d.address || "");
      }
    } catch (err) {
      console.error("❌ fetchSettings error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!initialData) fetchSettings();
  }, []);

  // =============================
  // LOAD CURRENCIES
  // =============================
  useEffect(() => {
    setCurrencies(
      CURRENCIES.map((c) => ({
        value: c.code,
        label: `${c.name} (${getSymbolFromCurrency(c.code)})`,
      }))
    );
  }, []);

  // =============================
  // LOAD STATES BY COUNTRY
  // =============================
  useEffect(() => {
    if (!country) return setStates([]);

    statesByCountry(country)
      .then((list) =>
        setStates(
          list.map((s: any) => ({
            value: s.iso2,
            label: s.name,
          }))
        )
      )
      .catch(console.error);
  }, [country]);

  // =============================
  // FORM INPUTS
  // =============================
  const inputFields: Form = {
    phone: {
      type: "text",
      value: phone,
      setValue: setPhone,
      label: "Mobile Number",
      containerClassName: "md:col-span-6",
    },
    whatsapp: {
      type: "text",
      value: whatsapp,
      setValue: setWhatsapp,
      label: (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
          <span>WhatsApp Number</span>
          <button
            type="button"
            className="text-primary text-sm underline text-left sm:text-right"
            onClick={() => setWhatsapp(phone)}
          >
            Same as Mobile
          </button>
        </div>
      ),
      containerClassName: "md:col-span-6",
    },
    email: {
      type: "email",
      value: email,
      setValue: setEmail,
      label: "Email Address",
      containerClassName: "md:col-span-6",
    },
    currency: {
      type: "select",
      value: currency,
      setValue: setCurrency,
      label: "Currency",
      options: currencies,
      containerClassName: "md:col-span-6",
    },
    country: {
      type: "select",
      value: country,
      setValue: setCountry,
      label: "Country",
      options: COUNTRIES,
      containerClassName: "md:col-span-6",
    },
    state: {
      type: "select",
      value: state,
      setValue: setStateValue,
      label: "State",
      options: states,
      containerClassName: "md:col-span-6",
    },
    address: {
      type: "textarea",
      value: address,
      setValue: setAddress,
      label: "Address",
    },
  };

  // =============================
  // SAVE SETTINGS
  // =============================
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await updateBasicSettings({
        logo,
        favicon,
        email,
        phone,
        whatsapp,
        currency,
        country,
        state,
        address,
      });

      handleToast(res);
      if (res.success) fetchSettings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Contact Info */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Contact Information</h3>
        <FormInputs inputFields={inputFields} />
      </div>

      {/* Brand Identity */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Brand Identity</h3>
        
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {/* Logo Upload */}
          <div className="flex flex-col items-center w-full sm:w-auto">
            <p className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">Logo</p>
            <LogoUpload value={logo} setValue={setLogo} />
          </div>
          
          {/* Favicon Upload */}
          <div className="flex flex-col items-center w-full sm:w-auto">
            <p className="text-sm font-medium text-gray-700 mb-3 sm:mb-4">Favicon</p>
            <FaviconUpload value={favicon} setValue={setFavicon} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default BasicSettings;