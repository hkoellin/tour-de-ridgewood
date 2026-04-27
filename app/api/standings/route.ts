import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateStandings } from "@/lib/standings/calculate";

export async function GET() {
  const runners = await prisma.runner.findMany({
    select: {
      id: true,
      name: true,
      team: { select: { name: true, color: true } },
      results: { select: { elapsedSeconds: true } },
    },
  });

  const standings = calculateStandings(runners);
  return NextResponse.json(standings);
}
