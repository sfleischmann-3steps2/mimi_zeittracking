import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { projects: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const client = await prisma.client.create({
    data: { name: body.name },
    include: { projects: true },
  });

  return NextResponse.json(client, { status: 201 });
}
