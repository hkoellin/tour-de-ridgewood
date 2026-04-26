import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { internalError } from "@/lib/errors";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { runners: true } },
      },
    });

    const result = teams.map((team) => ({
      id: team.id,
      name: team.name,
      color: team.color,
      logoUrl: team.logoUrl,
      runnerCount: team._count.runners,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/teams]", error);
    return internalError();
  }
}
