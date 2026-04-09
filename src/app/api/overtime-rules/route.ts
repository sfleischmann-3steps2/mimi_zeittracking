import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const rules = await prisma.overtimeRule.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { gueltigAb: "desc" },
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("GET /api/overtime-rules error:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rule = await prisma.overtimeRule.create({
      data: {
        projectId: body.projectId,
        sollZeit: body.sollZeit,
        ueberstundenAktiv: body.ueberstundenAktiv,
        gueltigAb: new Date(body.gueltigAb),
        gueltigBis: body.gueltigBis ? new Date(body.gueltigBis) : null,
      },
      include: { project: { include: { client: true } } },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("POST /api/overtime-rules error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
  }
}
