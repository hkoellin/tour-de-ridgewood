import { TableSkeleton } from "@/components/ui/Skeleton";

export default function LoadingTeamDetail() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-8" aria-hidden="true" />
      <TableSkeleton rows={6} cols={3} />
    </main>
  );
}
