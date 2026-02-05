import BasicSettings from "@/components/forms/settings/basic-settings/basic-settings";
import { currentUser } from "@/lib/api/users";

const Settings = async () => {
  const user = await currentUser();

  // 🔐 Guard: user must exist
  if (!user) {
    return (
      <div className="p-6 text-red-500">
        Unable to load user settings. Please login again.
      </div>
    );
  }

  // ✅ Correct variable
  const settingsData =
    Array.isArray(user.siteSettings) && user.siteSettings.length > 0
      ? user.siteSettings[0]
      : null;

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Basic Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Update and customize the basic site settings.
        </p>
      </div>

      {/* ✅ PASS CORRECT DATA */}
      <BasicSettings
        user={user}                 // ✅ profile data
        initialData={settingsData}  // ✅ site settings
      />
    </div>
  );
};

export default Settings;
