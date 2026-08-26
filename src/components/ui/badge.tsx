import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border-slate-200/80 bg-slate-100 text-slate-700 hover:bg-slate-200/80",
        destructive: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        outline: "text-slate-700 border-slate-200 bg-transparent",
        pending: "border-amber-200/80 bg-amber-50 text-amber-700",
        approved: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
        rejected: "border-rose-200/80 bg-rose-50 text-rose-700",
        completed: "border-teal-200/80 bg-teal-50 text-teal-700",
        inprogress: "border-sky-200/80 bg-sky-50 text-sky-700",
        nabl: "border-transparent bg-slate-800 text-white",
        fssai: "border-transparent bg-teal-800 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
