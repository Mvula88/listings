// ============================================================================
// SKELETON LOADING COMPONENT
// ============================================================================
// Reusable skeleton loading component for better perceived performance
// Usage: <Skeleton className="h-4 w-full" />
// ============================================================================

import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  )
}
