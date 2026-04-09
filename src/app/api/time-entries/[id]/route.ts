import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.startTime !== undefined) data.startTime = new Date(body.startTime);
  if (body.endTime !== undefined)
    data.endTime = body.endTime ? new Date(body.endTime) : null;
  if (body.duration !== undefined) data.duration = body.duration;
  if (body.taetigkeit !== undefined) data.taetigkeit = body.taetigkeit;
  if (body.projectId !== undefined) data.projectId = body.projectId;
  if (body.taskAreaId !== undefined) data.taskAreaId = body.taskAreaId || null;
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.deletedAt !== undefined)
    data.deletedAt = body.deletedAt ? new Date(body.deletedAt) : null;

  const entry = await prisma.timeEntry.update({
    where: { id },
    data,
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Soft delete
  await prisma.timeEntry.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
