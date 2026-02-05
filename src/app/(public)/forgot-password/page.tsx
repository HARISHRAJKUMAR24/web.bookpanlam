
import ForgotPasswordForm from "@/components/forms/forgot-password-form";
import Image from "next/image";

function ForgotPassword() {
  return (
    <div className="w-full lg:grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-16">
          <ForgotPasswordForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://source.unsplash.com/1920x1080/?nature"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default ForgotPassword;