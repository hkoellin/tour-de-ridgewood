import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { StageCard } from "@/components/stages/StageCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Route",
  description: "All 8 stages of the Tour de Ridgewood running race.",
};

export default async function RoutePage() {
  const stages = await prisma.stage.findMany({
    orderBy: { stageNumber: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-race-yellow mb-2">
          The Race
        </div>
        <h1 className="text-4xl font-black text-race-black uppercase tracking-tight mb-3">
          Route
        </h1>
        <p className="text-gray-600 max-w-xl">
          Eight stages through the streets and parks of Ridgewood, Queens. Each stage covers a
          different part of the borough with unique terrain.
        </p>
      </div>

      {stages.length === 0 ? (
        <EmptyState
          title="Stages coming soon"
          description="The race route is being finalized. Check back soon!"
        />
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      )}
    </div>
  );
}
