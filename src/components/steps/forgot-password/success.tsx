import { Button } from "@/components/ui/button";
import { ShieldTick } from "iconsax-react";
import Link from "next/link";

const Success = () => {
  return (
    <div className="flex items-center justify-center flex-col">
      <ShieldTick size={72} className="text-primary" />
      <h3 className="text-2xl font-bold mt-5 mb-2.5 text-center">
        Password Changed!
      </h3>
      <p className="text-lg text-center">
        Your password has been changed successfully.
      </p>

      <Link href="/login" className="w-full">
        <Button className="w-full mt-7" size="lg">
          Back to Login
        </Button>
      </Link>
    </div>
  );
};

export default Success;
