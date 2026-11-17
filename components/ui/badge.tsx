import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ultramarine",
  {
    variants: {
      variant: {
        default: "border-ultramarine/30 bg-ultramarine/10 text-ultramarine",
        ember: "border-marigold/40 bg-marigold/15 text-navy",
        secondary: "border-mint/40 bg-mint/15 text-navy",
        cyan: "border-mint/40 bg-mint/15 text-navy",
        outline: "border-navy/15 bg-white text-navy/70",
        destructive: "border-rose-500/30 bg-rose-50 text-rose-700",
        success: "border-emerald-500/30 bg-emerald-50 text-emerald-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
