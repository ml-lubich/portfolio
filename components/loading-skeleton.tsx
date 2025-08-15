interface LoadingSkeletonProps {
  width?: number | string
  height?: number | string
  className?: string
}

export function LoadingSkeleton({ 
  width = "100%", 
  height = "1rem", 
  className = "" 
}: LoadingSkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <LoadingSkeleton width={280} height={280} className="rounded-full mx-auto mb-8" />
        <LoadingSkeleton width="300px" height="3rem" className="mx-auto mb-4" />
        <LoadingSkeleton width="400px" height="2rem" className="mx-auto mb-6" />
        <LoadingSkeleton width="600px" height="1.5rem" className="mx-auto mb-8" />
        <div className="flex justify-center space-x-4">
          <LoadingSkeleton width="120px" height="40px" className="rounded" />
          <LoadingSkeleton width="120px" height="40px" className="rounded" />
        </div>
      </div>
    </div>
  )
}
