import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

type ButtonVariant = "primary" | "secondary" | "ghost" | "strava" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-race-yellow text-race-black hover:bg-yellow-400 font-bold",
  secondary:
    "bg-race-black text-race-white hover:bg-gray-800 font-semibold border border-gray-700",
  ghost: "bg-transparent text-race-black hover:bg-gray-100 font-semibold",
  strava:
    "bg-strava-orange text-white hover:bg-orange-600 font-semibold",
  danger: "bg-red-600 text-white hover:bg-red-700 font-semibold",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 rounded",
  md: "text-sm px-4 py-2 rounded",
  lg: "text-base px-6 py-3 rounded-md",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", asChild = false, className = "", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={[
          "inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-race-yellow disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
