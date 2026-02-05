import ProfileSettings from "@/components/forms/settings/profile-settings";
import { currentUser } from "@/lib/api/users";
import { notFound } from "next/navigation";

const Page = async () => {
  const user = await currentUser();

  // ❗ If user is null → stop here (TS guarantee)
  if (!user) return notFound();

  return (
    <div>
      <div className="mb-9 space-y-1.5">
        <h3 className="font-medium">Profile Settings</h3>
        <p className="text-black/50 text-sm font-medium">
          Update your profile information.
        </p>
      </div>

      {/* Now TS knows `user` is DEFINITELY a User */}
      <ProfileSettings user={user} />
    </div>
  );
};

export default Page;
