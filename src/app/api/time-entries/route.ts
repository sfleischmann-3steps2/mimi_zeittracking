import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const projectId = searchParams.get("projectId");
  const includeDeleted = searchParams.get("includeDeleted") === "true";

  const where: Record<string, unknown> = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    where.date = { gte: start, lt: end };
  }

  if (projectId) {
    where.projectId = projectId;
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const entry = await prisma.timeEntry.create({
    data: {
      date: new Date(body.date),
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      duration: body.duration ?? null,
      taetigkeit: body.taetigkeit,
      projectId: body.projectId,
      taskAreaId: body.taskAreaId || null,
      notes: body.notes || null,
    },
    include: {
      project: { include: { client: true } },
      taskArea: true,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
