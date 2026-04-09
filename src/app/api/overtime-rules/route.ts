import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rules = await prisma.overtimeRule.findMany({
    include: { project: { include: { client: true } } },
    orderBy: { gueltigAb: "desc" },
  });
  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
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
}
