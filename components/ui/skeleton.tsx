import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("skel", className)}
      {...props}
    />
  )
}

export function SectionSkeleton({
  height = "60vh",
  className = "",
}: {
  height?: string
  className?: string
}) {
  return (
    <div
      className={cn("mx-auto max-w-5xl px-5 py-24 sm:px-8", className)}
      style={height ? { minHeight: height } : undefined}
      aria-busy="true"
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-9 w-2/3 max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  )
}
