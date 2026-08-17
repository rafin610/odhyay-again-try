import React from "react";

export function BookCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton aspect-[2/3] w-full rounded-sm bg-[#221d28]" />
      <div className="space-y-2">
        <div className="skeleton h-5 w-4/5 rounded bg-[#221d28]" />
        <div className="skeleton h-3 w-1/2 rounded bg-[#221d28]" />
        <div className="skeleton h-3 w-1/3 rounded bg-[#221d28]" />
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b hairline py-4">
      <div className="skeleton h-12 w-9 rounded-sm bg-[#221d28]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-1/3 rounded bg-[#221d28]" />
        <div className="skeleton h-3 w-1/4 rounded bg-[#221d28]" />
      </div>
      <div className="skeleton h-4 w-16 rounded bg-[#221d28]" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4 py-8">
      <div className="skeleton h-4 w-32 rounded bg-[#221d28]" />
      <div className="skeleton h-12 w-2/3 rounded bg-[#221d28]" />
      <div className="skeleton h-4 w-1/2 rounded bg-[#221d28]" />
    </div>
  );
}
