import TaxSettings from "@/components/forms/settings/tax-settings";
import { currentUser } from "@/lib/api/users";

const SettingsTax = async () => {
  const user = await currentUser();

  return (
    <div className="relative">
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">GST</h3>
        <p className="text-black/50 text-sm font-medium">
          Ensure compliance and transparent pricing.
        </p>
      </div>

<TaxSettings  />
    </div>
  );
};

export default SettingsTax;
