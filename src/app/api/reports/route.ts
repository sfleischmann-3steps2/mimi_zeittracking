import { NextRequest, NextResponse } from "next/server";
import {
  getDailyReport,
  getMonthlyReport,
  getClientReport,
  getProjectReport,
} from "@/lib/report-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "daily": {
        const date = searchParams.get("date");
        if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
        const report = await getDailyReport(new Date(date));
        return NextResponse.json(report);
      }

      case "monthly": {
        const year = parseInt(searchParams.get("year") || "");
        const month = parseInt(searchParams.get("month") || "");
        if (!year || !month) return NextResponse.json({ error: "year and month required" }, { status: 400 });
        const report = await getMonthlyReport(year, month);
        return NextResponse.json(report);
      }

      case "client": {
        const clientId = searchParams.get("clientId");
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        if (!clientId || !from || !to)
          return NextResponse.json({ error: "clientId, from, to required" }, { status: 400 });
        const report = await getClientReport(clientId, new Date(from), new Date(to));
        return NextResponse.json(report);
      }

      case "project": {
        const projectId = searchParams.get("projectId");
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        if (!projectId || !from || !to)
          return NextResponse.json({ error: "projectId, from, to required" }, { status: 400 });
        const report = await getProjectReport(projectId, new Date(from), new Date(to));
        return NextResponse.json(report);
      }

      default:
        return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des Reports" }, { status: 500 });
  }
}
