import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notFound, internalError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { stageNumber: string } }
) {
  const stageNumber = parseInt(params.stageNumber, 10);

  if (isNaN(stageNumber)) {
    return notFound("Stage not found");
  }

  try {
    const stage = await prisma.stage.findUnique({
      where: { stageNumber },
    });

    if (!stage) {
      return notFound("Stage not found");
    }

    return NextResponse.json(stage);
  } catch (error) {
    console.error("[GET /api/stages/:stageNumber]", error);
    return internalError();
  }
}
