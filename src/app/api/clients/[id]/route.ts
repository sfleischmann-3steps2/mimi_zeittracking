import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const client = await prisma.client.update({
    where: { id },
    data: { name: body.name },
    include: { projects: true },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const projectCount = await prisma.project.count({ where: { clientId: id } });
  if (projectCount > 0) {
    return NextResponse.json(
      { error: "Auftraggeber hat noch Projekte. Bitte zuerst Projekte löschen." },
      { status: 400 }
    );
  }

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
