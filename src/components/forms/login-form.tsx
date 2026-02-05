"use client";

import { setCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import PhoneInput from "../ui/phone-input";
import { loginUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const LoginForm = () => {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    try {
      if (!phone || !password) {
        toast.error("Enter phone and password");
        return;
      }

      setLoading(true);

      const cleanPhone = phone.replace(/^\+91/, "").trim();

      const response = await loginUser({
        phone: cleanPhone, // ✔ Allowed now
        password,
      });

      if (!response?.success) {
        toast.error(response?.message || "Login failed");
        setLoading(false);
        return;
      }

      if (response.token) {
        setCookie("token", response.token, {
          path: "/",
          sameSite: "lax",
        });
      }

      const db_id = response.user?.db_id;
      const user_id = response.user?.user_id;

      if (!db_id || !user_id) {
        toast.error("Login response missing user info");
        setLoading(false);
        return;
      }

      setCookie("id", String(db_id), { path: "/", sameSite: "lax" });
      setCookie("user_id", String(user_id), { path: "/", sameSite: "lax" });

      router.replace("/");
      router.refresh();

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      toast.error("Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8">
      {/* PHONE */}
      <div className="grid gap-3">
        <Label>Phone</Label>
        <PhoneInput
          placeholder="Phone Number"
          value={phone}
          onChange={(value: string | undefined) => setPhone(value || "")} // ✔ Fixed
          className="h-12 px-4 [&_input]:!text-base"
          autoFocus
          disabled={loading}
        />
      </div>

      {/* PASSWORD */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Password</Label>
          <Link href="/forgot-password" className="text-sm underline">
            Forgot Password
          </Link>
        </div>

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 px-4 text-base"
          disabled={loading}
        />
      </div>

      {/* LOGIN BUTTON */}
      <Button
        className="w-full h-12 text-base flex items-center justify-center gap-2"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" />}
        {loading ? "Logging in..." : "Login"}
      </Button>

      {/* REGISTER */}
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
