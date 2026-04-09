import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const taskAreas = await prisma.taskArea.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(taskAreas);
  } catch (error) {
    console.error("GET /api/task-areas error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const taskArea = await prisma.taskArea.create({
      data: { name: body.name },
    });

    return NextResponse.json(taskArea, { status: 201 });
  } catch (error) {
    console.error("POST /api/task-areas error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
