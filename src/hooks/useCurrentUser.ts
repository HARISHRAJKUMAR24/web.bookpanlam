import { currentUser } from "@/lib/api/users";
import { User } from "@/types";
import { useState, useEffect } from "react";

const useCurrentUser = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await currentUser();

        console.log("🔥 Hook currentUser() =>", user);

        setUserData(user);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, error };
};

export default useCurrentUser;
