import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { RunnerSchema } from "@/lib/validation/schemas";
import { unauthorized, forbidden, notFound, validationError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return unauthorized();
  if (session.user.role !== "admin") return forbidden();
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const runner = await prisma.runner.findUnique({ where: { id: params.id } });
  if (!runner) return notFound();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = RunnerSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const updated = await prisma.runner.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const runner = await prisma.runner.findUnique({ where: { id: params.id } });
  if (!runner) return notFound();

  // Cascade delete StravaToken
  await prisma.stravaToken.deleteMany({ where: { runnerId: params.id } });
  await prisma.runner.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
