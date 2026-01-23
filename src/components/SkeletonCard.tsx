"use client";

export default function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm animate-pulse">
      {/* Topic skeleton */}
      <div className="h-5 w-32 skeleton mb-3"></div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full skeleton"></div>
        <div className="h-4 w-4/5 skeleton"></div>
        <div className="h-4 w-2/3 skeleton"></div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 skeleton"></div>
        <div className="flex gap-3">
          <div className="h-8 w-16 skeleton rounded-lg"></div>
          <div className="h-8 w-16 skeleton rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
