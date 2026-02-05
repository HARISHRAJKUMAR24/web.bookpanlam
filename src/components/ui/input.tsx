"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeSlash } from "iconsax-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    return (
      <div className="relative w-full">
        <input
          type={
            type == "password" ? (showPassword ? "text" : "password") : type
          }
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-[15px] ring-offset-background file:border-0 file:bg-transparent file:text-[15px] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 !ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />

        {type == "password" && (
          <button
            type="button"
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
