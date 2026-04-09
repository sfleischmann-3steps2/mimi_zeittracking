import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const taskAreas = await prisma.taskArea.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(taskAreas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const taskArea = await prisma.taskArea.create({
    data: { name: body.name },
  });

  return NextResponse.json(taskArea, { status: 201 });
}
