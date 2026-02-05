import SeoSettings from "@/components/forms/settings/seo-settings/seo-settings";
import { getSeoSettings } from "@/lib/api/seo-settings";

const SettingsSEO = async () => {
  // Fetch SEO data directly from your PHP backend
  const seo = await getSeoSettings();

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">SEO Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Update and customize the SEO Settings.
        </p>
      </div>

      <SeoSettings 
        settingsData={seo?.data ?? null}
        userId={seo?.data?.user_id}  // REAL PRIMARY KEY
      />
    </div>
  );
};

export default SettingsSEO;
