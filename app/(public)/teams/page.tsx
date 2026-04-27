import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { TeamCard } from "@/components/teams/TeamCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Teams",
  description: "All teams and runners in the Tour de Ridgewood race.",
};

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { runners: true } },
    },
  });

  const teamsWithCount = teams.map((team) => ({
    id: team.id,
    name: team.name,
    color: team.color,
    logoUrl: team.logoUrl,
    runnerCount: team._count.runners,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-race-yellow mb-2">
          The Participants
        </div>
        <h1 className="text-4xl font-black text-race-black uppercase tracking-tight mb-3">
          Teams
        </h1>
        <p className="text-gray-600 max-w-xl">
          Meet the teams competing in this year&apos;s Tour de Ridgewood. Click any team to see its
          full roster.
        </p>
      </div>

      {teamsWithCount.length === 0 ? (
        <EmptyState
          title="Teams coming soon"
          description="Teams are being registered. Check back soon!"
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teamsWithCount.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
