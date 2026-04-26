import { TableSkeleton } from "@/components/ui/Skeleton";

export default function LoadingStandings() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-40 bg-gray-800 rounded animate-pulse mb-2" aria-hidden="true" />
      <div className="h-4 w-56 bg-gray-800 rounded animate-pulse mb-8" aria-hidden="true" />
      <TableSkeleton rows={10} cols={5} />
    </main>
  );
}
