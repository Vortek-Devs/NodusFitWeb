"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand-400 text-on-brand hover:bg-brand-300",
        outline: "border border-border bg-surface text-ink-primary hover:bg-hover",
        ghost: "text-ink-primary hover:bg-hover",
        destructive: "bg-danger-bg text-danger-text hover:bg-danger-bg/80",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  asChild = false,
  type,
  variant,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);
  if (asChild) return <Slot className={classes} {...props} />;
  return <button type={type ?? "button"} className={classes} {...props} />;
}
