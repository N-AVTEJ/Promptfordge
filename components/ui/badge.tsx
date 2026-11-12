import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ember-500",
  {
    variants: {
      variant: {
        default: "border-ember-500/30 bg-ember-500/10 text-ember-400",
        secondary: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        outline: "border-forge-border bg-forge-surface text-forge-muted",
        destructive: "border-rose-500/40 bg-rose-500/10 text-rose-300",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
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
