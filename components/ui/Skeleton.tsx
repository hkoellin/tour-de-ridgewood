import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
}

export function Skeleton({ height = "h-4", width = "w-full", className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={["animate-pulse bg-gray-200 rounded", height, width, className].join(" ")}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={["border border-gray-200 rounded-lg p-6 space-y-3", className].join(" ")}>
      <Skeleton height="h-6" width="w-1/3" />
      <Skeleton height="h-4" width="w-2/3" />
      <Skeleton height="h-4" width="w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100">
      <Skeleton height="h-8" width="w-8" className="rounded-full flex-shrink-0" />
      <Skeleton height="h-4" width="w-40" />
      <Skeleton height="h-4" width="w-24 ml-auto" />
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div
      className="overflow-x-auto"
      aria-busy="true"
      aria-label="Loading table data"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <Skeleton height="h-3" width="w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-gray-900">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-3 px-4">
                  <Skeleton height="h-3" width="w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
