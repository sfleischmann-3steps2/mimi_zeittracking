import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { projects: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}
