"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "@/config";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const res = await axios.post(
          `${apiUrl}/users/user-with-token.php`,
          {},
          { withCredentials: true }
        );

        if (!active) return;

        if (res.data?.success) {
          setUser(res.data.data);
        } else {
          setUser(undefined); // ❌ not logged in
        }
      } catch {
        setUser(undefined);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
