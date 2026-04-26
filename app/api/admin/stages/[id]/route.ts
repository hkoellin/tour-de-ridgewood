import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { StageSchema } from "@/lib/validation/schemas";
import { unauthorized, forbidden, notFound, validationError, conflict } from "@/lib/errors";

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

  const stage = await prisma.stage.findUnique({ where: { id: params.id } });
  if (!stage) return notFound();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = StageSchema.partial().safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const updated = await prisma.stage.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const stage = await prisma.stage.findUnique({ where: { id: params.id } });
  if (!stage) return notFound();

  const resultCount = await prisma.result.count({ where: { stageId: params.id } });
  if (resultCount > 0) {
    return conflict("Cannot delete stage with existing results");
  }

  await prisma.stage.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
