import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notFound, internalError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
      include: {
        runners: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!team) {
      return notFound("Team not found");
    }

    const runners = team.runners.map((runner) => ({
      ...runner,
      stravaLinked: runner.stravaAthleteId !== null,
    }));

    return NextResponse.json({ ...team, runners });
  } catch (error) {
    console.error("[GET /api/teams/:teamId]", error);
    return internalError();
  }
}
