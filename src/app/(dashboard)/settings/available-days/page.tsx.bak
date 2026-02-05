import AvailableDays from "@/components/forms/oth-opts/available-days";
import { currentUser } from "@/lib/api/users";

const SettingsAvailableDays = async () => {
  const user = await currentUser();

  return (
    <div>
      {/* <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Available Days</h3>
        <p className="text-black/50 text-sm font-medium">
          Choose the days when customers can book appointments. Please note
          it&apos;s a 24hrs time (Railway timing)
        </p>
      </div> */}

      <AvailableDays settingsData={user.siteSettings?.[0] ?? null} />
    </div>
  );
};

export default SettingsAvailableDays;
