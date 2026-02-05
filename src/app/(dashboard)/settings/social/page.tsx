import SocialSettings from "@/components/forms/settings/social-settings";
import { currentUser } from "@/lib/api/users";

const SettingsSocial = async () => {
  const user = await currentUser();

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Social Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Connect with customers and grow your online presence.
        </p>
      </div>

      <SocialSettings />
    </div>
  );
};

export default SettingsSocial;
