import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const entry = await prisma.timeEntry.update({
    where: { id },
    data: { deletedAt: null },
  });

  return NextResponse.json(entry);
}
