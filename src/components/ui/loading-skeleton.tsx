import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className, rows = 5 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-md bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="h-4 w-1/3 rounded bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted" />
      <div className="h-8 w-1/2 rounded bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted" />
      <div className="h-3 w-2/3 rounded bg-muted animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-muted via-muted/60 to-muted" />
    </div>
  );
}
