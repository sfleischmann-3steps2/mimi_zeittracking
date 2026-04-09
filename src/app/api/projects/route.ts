import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const where = clientId ? { clientId } : {};

  const projects = await prisma.project.findMany({
    where,
    include: { client: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(projects);
}
