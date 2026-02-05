import ChangePassword from "@/components/forms/settings/change-password";
import { currentUser } from "@/lib/api/users";

const SettingsChangePassword = async () => {
  const user = await currentUser();

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Change Password</h3>
        <p className="text-black/50 text-sm font-medium">
          Update and customize your account password.
        </p>
      </div>

      <ChangePassword user={user && { ...user, siteSettings: [user.siteSettings] }} />
    </div>
  );
};

export default SettingsChangePassword;
