import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-2 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand-400 text-on-brand",
        outline: "border-border bg-surface text-ink-primary",
        success: "border-transparent bg-success-bg text-success-text",
        warning: "border-transparent bg-warning-bg text-warning-text",
        destructive: "border-transparent bg-danger-bg text-danger-text",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
