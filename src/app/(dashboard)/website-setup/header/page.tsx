import HeaderSettings from "@/components/forms/website-setup/header-settings";
import { getWebsiteSettings } from "@/lib/api/website-settings";

const Header = async () => {
  const data = await getWebsiteSettings();

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Header Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Update and customize the header content.
        </p>
      </div>

      <HeaderSettings data={data} />
    </div>
  );
};

export default Header;
