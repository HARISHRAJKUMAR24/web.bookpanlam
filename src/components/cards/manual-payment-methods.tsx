"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import ManualPaymentMethodForm from "../forms/settings/payment-settings/manual-payment-method-form";
import ManualPaymentMethodCard from "@/components/cards/manual-payment-methods/manual-payment-method-card";
import { Button } from "@/components/ui/button";

import {
  getManualPaymentMethods,
} from "@/lib/api/manual-payment-methods";
import type { ManualPaymentMethod } from "@/types";

interface Props {
data?: any[];
}

const ManualPaymentMethods = ({ data = [] }: Props) => {
  const [reload, setReload] = useState(0);
  const [manualPaymentMethodData, setManualPaymentMethodData] =
    useState<ManualPaymentMethod[]>(data);
  const [loading, setLoading] = useState(false);

const fetchMethods = async () => {
  try {
    setLoading(true);
    const res = await getManualPaymentMethods();

    // ✅ ONLY THIS LINE MATTERS
    setManualPaymentMethodData(res?.records ?? []);
  } catch (error) {
    console.error("Failed to fetch manual payment methods", error);
    setManualPaymentMethodData([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchMethods();
  }, [reload]);

  return (
    <div>
      <div className="grid gap-6">
        {loading && (
          <p className="text-sm text-black/50">
            Loading manual payment methods…
          </p>
        )}

        {!loading && manualPaymentMethodData.length === 0 && (
          <p className="text-sm text-black/50">
            No manual payment methods added yet.
          </p>
        )}

        {manualPaymentMethodData?.map((item) => (
          <ManualPaymentMethodCard
            key={item.id}
            data={item}
            setReload={setReload}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <ManualPaymentMethodForm setReload={setReload}>
          <Button variant="outline" className="gap-2">
            <Plus size={18} />
            Add Manual Payment Method
          </Button>
        </ManualPaymentMethodForm>
      </div>
    </div>
  );
};

export default ManualPaymentMethods;
