import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { getActivitiesForStageDate } from "@/lib/strava/activities";
import { unauthorized, notFound, badGateway } from "@/lib/errors";
import { StravaApiError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { stageNumber: string } }
) {
  const session = await auth();
  if (!session?.user?.runnerId) return unauthorized();

  const stageNumber = parseInt(params.stageNumber, 10);
  if (isNaN(stageNumber)) return notFound();

  const stage = await prisma.stage.findUnique({
    where: { stageNumber },
    select: { id: true, date: true },
  });
  if (!stage) return notFound();

  // Get the runner's Strava token
  const tokenRecord = await prisma.stravaToken.findUnique({
    where: { runnerId: session.user.runnerId },
    select: { accessToken: true, expiresAt: true },
  });

  if (!tokenRecord) {
    return NextResponse.json({ error: "No Strava token found. Please reconnect Strava." }, { status: 403 });
  }

  try {
    const activities = await getActivitiesForStageDate(
      tokenRecord.accessToken,
      stage.date
    );
    return NextResponse.json(activities);
  } catch (err) {
    if (err instanceof StravaApiError) {
      return badGateway("Unable to fetch activities from Strava.");
    }
    throw err;
  }
}
