import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const taskAreas = await prisma.taskArea.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(taskAreas);
}
