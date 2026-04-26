import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "@/lib/errors";

interface LeaderboardEntry {
  rank: number;
  runnerId: string;
  runnerName: string;
  teamName: string;
  teamColor: string;
  elapsedSeconds: number;
  submittedAt: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { stageNumber: string } }
) {
  const stageNumber = parseInt(params.stageNumber, 10);
  if (isNaN(stageNumber)) return notFound();

  const stage = await prisma.stage.findUnique({
    where: { stageNumber },
    select: { id: true },
  });
  if (!stage) return notFound();

  const results = await prisma.result.findMany({
    where: { stageId: stage.id },
    include: {
      runner: {
        select: { id: true, name: true, team: { select: { name: true, color: true } } },
      },
    },
    orderBy: { elapsedSeconds: "asc" },
  });

  const leaderboard: LeaderboardEntry[] = results.map((result, index) => ({
    rank: index + 1,
    runnerId: result.runner.id,
    runnerName: result.runner.name,
    teamName: result.runner.team.name,
    teamColor: result.runner.team.color,
    elapsedSeconds: result.elapsedSeconds,
    submittedAt: result.submittedAt.toISOString(),
  }));

  return NextResponse.json(leaderboard);
}
