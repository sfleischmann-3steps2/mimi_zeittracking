import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const where = clientId ? { clientId } : {};

    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Projekte" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const project = await prisma.project.create({
      data: { name: body.name, clientId: body.clientId },
      include: { client: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Projekts" }, { status: 500 });
  }
}
