import HomepageSettings from "@/components/forms/website-setup/homepage-settings/homepage-settings";
import { getWebsiteSettings } from "@/lib/api/website-settings";
import { cookies } from "next/headers";  // ⭐ REQUIRED

const Homepage = async () => {
  const data = await getWebsiteSettings();

  // ⭐ REAL USER ID
  const userId = Number(cookies().get("user_id")?.value);

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Homepage Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Update and customize the homepage content.
        </p>
      </div>

      {/* ⭐ Now userId is passed correctly */}
      <HomepageSettings
        data={data}
        userId={userId}
      />
    </div>
  );
};

export default Homepage;
