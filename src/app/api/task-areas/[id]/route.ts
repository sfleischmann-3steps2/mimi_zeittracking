import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const taskArea = await prisma.taskArea.update({
    where: { id },
    data: { name: body.name },
  });

  return NextResponse.json(taskArea);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.taskArea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
