import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { calculateStandings } from "@/lib/standings/calculate";
import { GCTable } from "@/components/standings/GCTable";

export const metadata: Metadata = {
  title: "General Classification — Tour de Ridgewood",
  description: "Overall standings for the Tour de Ridgewood cycling race.",
};

export default async function StandingsPage() {
  const [runners, session] = await Promise.all([
    prisma.runner.findMany({
      select: {
        id: true,
        name: true,
        team: { select: { name: true, color: true } },
        results: { select: { elapsedSeconds: true } },
      },
    }),
    auth(),
  ]);

  const standings = calculateStandings(runners);

  // Total stages is 8 per the race spec
  const TOTAL_STAGES = 8;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-race-black">General Classification</h1>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Overall standings ranked by number of completed stages then cumulative time.
          Participants must complete all {TOTAL_STAGES} stages to be eligible for the final GC.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <GCTable
          standings={standings}
          currentRunnerId={session?.user?.runnerId ?? null}
          totalStages={TOTAL_STAGES}
        />
      </div>
    </div>
  );
}
