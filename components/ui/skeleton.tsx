import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-navy/10", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function LabResultSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-6 shadow-xs animate-pulse">
      <div className="flex items-center justify-between border-b border-navy/10 pb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3 pt-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
