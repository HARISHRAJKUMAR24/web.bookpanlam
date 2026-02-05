import LoginForm from "@/components/forms/login-form";
import Image from "next/image";
import { currentUser } from "@/lib/api/users";
import { redirect } from "next/navigation";

export default async function Login() {
  const user = await currentUser();

  // If logged in → do NOT allow access to login page
  if (user) {
    redirect("/dashboard"); // or "/appointments"
  }

  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-16">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login to your account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your details below to login your account
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      <div className="hidden bg-muted lg:block">
        <Image
          src="/login-bg.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
