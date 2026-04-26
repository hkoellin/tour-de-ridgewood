import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notFound, internalError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { runnerId: string } }
) {
  try {
    const runner = await prisma.runner.findUnique({
      where: { id: params.runnerId },
      include: {
        team: {
          select: { id: true, name: true, color: true },
        },
        results: {
          include: {
            stage: {
              select: { stageNumber: true, name: true },
            },
          },
          orderBy: { stage: { stageNumber: "asc" } },
        },
      },
    });

    if (!runner) {
      return notFound("Runner not found");
    }

    return NextResponse.json(runner);
  } catch (error) {
    console.error("[GET /api/runners/:runnerId]", error);
    return internalError();
  }
}
