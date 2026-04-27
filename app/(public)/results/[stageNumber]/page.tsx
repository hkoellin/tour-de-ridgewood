import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { LeaderboardTable } from "@/components/results/LeaderboardTable";

interface ResultsPageProps {
  params: { stageNumber: string };
}

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  return { title: `Stage ${params.stageNumber} Results — Tour de Ridgewood` };
}

export default async function StageResultsPage({ params }: ResultsPageProps) {
  const stageNumber = parseInt(params.stageNumber, 10);
  if (isNaN(stageNumber)) notFound();

  const [stage, session] = await Promise.all([
    prisma.stage.findUnique({ where: { stageNumber }, select: { id: true, name: true, stageNumber: true } }),
    auth(),
  ]);

  if (!stage) notFound();

  const results = await prisma.result.findMany({
    where: { stageId: stage.id },
    include: {
      runner: {
        select: { id: true, name: true, team: { select: { name: true, color: true } } },
      },
    },
    orderBy: { elapsedSeconds: "asc" },
  });

  const entries = results.map((result, index) => ({
    rank: index + 1,
    runnerId: result.runner.id,
    runnerName: result.runner.name,
    teamName: result.runner.team.name,
    teamColor: result.runner.team.color,
    elapsedSeconds: result.elapsedSeconds,
    submittedAt: result.submittedAt.toISOString(),
  }));

  const runnerId = session?.user?.runnerId ?? null;
  const hasSubmitted = runnerId ? entries.some((e) => e.runnerId === runnerId) : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-race-black">
            Stage {stage.stageNumber} Results
          </h1>
          <p className="text-gray-500 mt-1">{stage.name}</p>
        </div>
        <Link
          href={`/route/${stage.stageNumber}`}
          className="text-sm text-gray-500 hover:text-race-black transition-colors"
        >
          ← Stage details
        </Link>
      </div>

      {/* Submit CTA for authenticated runners who haven't submitted */}
      {runnerId && !hasSubmitted && (
        <div className="bg-race-yellow/10 border border-race-yellow rounded-lg p-4 mb-8 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-race-black">
            You haven&apos;t submitted your result for this stage yet.
          </p>
          <Link
            href={`/submit/${stage.stageNumber}`}
            className="flex-shrink-0 bg-race-black text-race-yellow font-black text-sm px-4 py-2 rounded hover:bg-gray-900 transition-colors"
          >
            Submit Result
          </Link>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <LeaderboardTable entries={entries} currentRunnerId={runnerId} />
      </div>
    </div>
  );
}
