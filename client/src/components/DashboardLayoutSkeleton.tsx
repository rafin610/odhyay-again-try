import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#111015]">
      {/* Header skeleton */}
      <div className="border-b hairline bg-[#0d0c10] px-6 py-5 md:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="skeleton h-6 w-6 bg-[#2a2430]" />
            <Skeleton className="skeleton h-5 w-32 bg-[#2a2430]" />
          </div>
          <Skeleton className="skeleton h-5 w-48 bg-[#2a2430]" />
        </div>
      </div>

      {/* Main content */}
      <div className="container py-8 md:py-12">
        <div className="space-y-8">
          {/* Page header skeleton */}
          <div className="space-y-4">
            <Skeleton className="skeleton h-4 w-24 bg-[#2a2430]" />
            <Skeleton className="skeleton h-10 w-64 bg-[#2a2430]" />
            <Skeleton className="skeleton h-4 w-96 bg-[#2a2430]" />
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="skeleton aspect-[2/3] bg-[#2a2430]" />
                <Skeleton className="skeleton h-5 w-3/4 bg-[#2a2430]" />
                <Skeleton className="skeleton h-3 w-1/2 bg-[#2a2430]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
