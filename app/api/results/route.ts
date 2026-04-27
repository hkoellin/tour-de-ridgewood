import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ResultSchema } from "@/lib/validation/schemas";
import { unauthorized, forbidden, validationError, internalError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (!session.user.runnerId) return forbidden("Strava account not connected");

  const runnerId = session.user.runnerId;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = ResultSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { stageId, elapsedSeconds, stravaActivityId } = parsed.data;

  // Verify stage exists
  const stage = await prisma.stage.findUnique({ where: { id: stageId }, select: { id: true } });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  try {
    const existing = await prisma.result.findFirst({ where: { runnerId, stageId } });

    const result = await prisma.result.upsert({
      where: { runnerId_stageId: { runnerId, stageId } },
      create: {
        runnerId,
        stageId,
        elapsedSeconds,
        stravaActivityId,
      },
      update: {
        elapsedSeconds,
        stravaActivityId,
      },
    });

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch {
    return internalError();
  }
}
