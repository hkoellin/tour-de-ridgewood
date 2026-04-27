import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { TeamSchema } from "@/lib/validation/schemas";
import { unauthorized, forbidden, validationError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "admin") return forbidden();
  return null;
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = TeamSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const team = await prisma.team.create({ data: parsed.data });
  return NextResponse.json(team, { status: 201 });
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const teams = await prisma.team.findMany({
    include: { _count: { select: { runners: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(teams);
}
