import PaymentProviders from "@/components/forms/settings/payment-settings/payment-providers";
import { currentUser } from "@/lib/api/users";
import ManualPaymentMethods from "@/components/cards/manual-payment-methods";

const SettingsPayment = async () => {
  // ✅ server-safe (auth / guard)
  await currentUser();

  return (
    <div>
      {/* Payment Providers */}
      <div>
        <div className="mb-9 space-y-1.5">
          <h3 className="font-medium">Payment Providers</h3>
          <p className="text-black/50 text-sm font-medium">
            Manage payment providers to accept payments from your customers.
          </p>
        </div>

        <PaymentProviders />
      </div>

      {/* Manual Payment Methods */}
      <div className="mt-8 pt-8 border-t">
        <div className="mb-9 space-y-1.5">
          <h3 className="font-medium">Manual Payment Methods</h3>
          <p className="text-black/50 text-sm font-medium">
            Enables offline payments like bank transfer, UPI, or other custom
            methods.
          </p>
        </div>

        {/* ✅ CLIENT SIDE FETCH */}
        <ManualPaymentMethods  />
      </div>
    </div>
  );
};

export default SettingsPayment;
