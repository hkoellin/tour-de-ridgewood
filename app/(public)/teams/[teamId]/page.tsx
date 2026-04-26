import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { RunnerRow } from "@/components/teams/RunnerRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { auth } from "@/lib/auth/config";

interface TeamDetailPageProps {
  params: { teamId: string };
}

export async function generateMetadata({ params }: TeamDetailPageProps): Promise<Metadata> {
  const team = await prisma.team.findUnique({ where: { id: params.teamId } });
  if (!team) return { title: "Team Not Found" };
  return { title: team.name, description: `${team.name} roster and runners.` };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const [team, session] = await Promise.all([
    prisma.team.findUnique({
      where: { id: params.teamId },
      include: {
        runners: { orderBy: { name: "asc" } },
      },
    }),
    auth(),
  ]);

  if (!team) notFound();

  const sessionRunnerId = session?.user?.runnerId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-race-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Teams
      </Link>

      {/* Team header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-gray-200"
          style={{ backgroundColor: team.color }}
          aria-label={`${team.name} color`}
        />
        <div>
          <h1 className="text-3xl font-black text-race-black uppercase tracking-tight">
            {team.name}
          </h1>
          <p className="text-gray-500 text-sm">{team.runners.length} runners</p>
        </div>
      </div>

      {/* Roster */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500">Roster</h2>
        </div>

        {team.runners.length === 0 ? (
          <EmptyState title="No runners yet" description="This team hasn't registered any runners." />
        ) : (
          <div>
            {team.runners.map((runner) => (
              <RunnerRow
                key={runner.id}
                runner={{
                  id: runner.id,
                  name: runner.name,
                  stravaLinked: runner.stravaAthleteId !== null,
                }}
                teamColor={team.color}
                highlighted={runner.id === sessionRunnerId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
