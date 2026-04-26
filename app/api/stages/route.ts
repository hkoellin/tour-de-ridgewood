import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { internalError } from "@/lib/errors";

export async function GET() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { stageNumber: "asc" },
    });
    return NextResponse.json(stages);
  } catch (error) {
    console.error("[GET /api/stages]", error);
    return internalError();
  }
}
