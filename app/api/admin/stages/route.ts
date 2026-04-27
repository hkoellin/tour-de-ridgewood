import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { StageSchema } from "@/lib/validation/schemas";
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

  const parsed = StageSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const stage = await prisma.stage.create({ data: parsed.data });
  return NextResponse.json(stage, { status: 201 });
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const stages = await prisma.stage.findMany({ orderBy: { stageNumber: "asc" } });
  return NextResponse.json(stages);
}
