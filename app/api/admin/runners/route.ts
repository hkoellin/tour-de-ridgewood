import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { RunnerSchema } from "@/lib/validation/schemas";
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

  const parsed = RunnerSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const runner = await prisma.runner.create({ data: parsed.data });
  return NextResponse.json(runner, { status: 201 });
}

export async function GET(_req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const runners = await prisma.runner.findMany({
    include: { team: { select: { name: true, color: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(runners);
}
