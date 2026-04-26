import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { RunnerResultsTable } from "@/components/results/RunnerResultsTable";

interface RunnerProfilePageProps {
  params: { runnerId: string };
}

export async function generateMetadata({ params }: RunnerProfilePageProps): Promise<Metadata> {
  const runner = await prisma.runner.findUnique({ where: { id: params.runnerId } });
  if (!runner) return { title: "Runner Not Found" };
  return { title: runner.name, description: `${runner.name}'s profile and stage results.` };
}

export default async function RunnerProfilePage({ params }: RunnerProfilePageProps) {
  const runner = await prisma.runner.findUnique({
    where: { id: params.runnerId },
    include: {
      team: { select: { id: true, name: true, color: true } },
      results: {
        include: {
          stage: { select: { stageNumber: true, name: true } },
        },
        orderBy: { stage: { stageNumber: "asc" } },
      },
    },
  });

  if (!runner) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={`/teams/${runner.team.id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-race-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {runner.team.name}
      </Link>

      {/* Runner header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-black flex-shrink-0"
          style={{ backgroundColor: runner.team.color }}
          aria-hidden="true"
        >
          {runner.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-black text-race-black">{runner.name}</h1>
          <Link
            href={`/teams/${runner.team.id}`}
            className="text-sm text-gray-500 hover:text-race-black transition-colors flex items-center gap-1.5"
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: runner.team.color }}
              aria-hidden="true"
            />
            {runner.team.name}
          </Link>
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">
          Stage Results
        </h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <RunnerResultsTable results={runner.results} />
        </div>
      </div>
    </div>
  );
}
