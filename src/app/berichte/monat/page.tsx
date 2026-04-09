"use client";

import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { formatDuration } from "@/lib/time-utils";
import ExportButtons from "@/components/reports/ExportButtons";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default function Monatsreport() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=monthly&year=${year}&month=${month}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarDays size={28} /> Monatsreport
        </h1>
        <div className="flex items-center gap-4">
          <ExportButtons params={{ type: "monthly", year: String(year), month: String(month) }} />
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">&larr;</button>
            <span className="font-medium text-gray-900 min-w-[140px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">&rarr;</button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Laden...</p>
      ) : !report ? null : (
        <>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Gesamtzeit</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatDuration(report.totalDuration)} h
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Arbeitstage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {report.days.filter((d: any) => d.duration > 0).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Einträge</p>
                <p className="text-3xl font-bold text-gray-900">
                  {report.entryCount}
                </p>
              </div>
            </div>
          </div>

          {/* Projects with overtime */}
          {report.byProject.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Nach Projekt</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Projekt</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Auftraggeber</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Ist-Stunden</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Soll-Stunden</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Überstunden</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byProject.map((proj: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{proj.name}</td>
                      <td className="px-4 py-3 text-gray-500">{proj.client}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatDuration(proj.duration)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        {proj.sollZeit !== null ? `${proj.sollZeit} h` : "–"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {proj.ueberstunden !== null ? (
                          <span className={proj.ueberstunden >= 0 ? "text-green-600" : "text-red-600"}>
                            {proj.ueberstunden >= 0 ? "+" : ""}{proj.ueberstunden.toFixed(1)} h
                          </span>
                        ) : (
                          <span className="text-gray-400">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Calendar heatmap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Tagesübersicht</h2>
            <div className="grid grid-cols-7 gap-2">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                <div key={d} className="text-xs text-center text-gray-400 font-medium pb-1">{d}</div>
              ))}
              {(() => {
                const firstDay = new Date(year, month - 1, 1).getDay();
                const offset = firstDay === 0 ? 6 : firstDay - 1;
                const cells = [];
                for (let i = 0; i < offset; i++) {
                  cells.push(<div key={`empty-${i}`} />);
                }
                for (const day of report.days) {
                  const d = parseInt(day.date.slice(-2));
                  const hours = day.duration / 3600;
                  const intensity = Math.min(hours / 8, 1);
                  cells.push(
                    <div
                      key={day.date}
                      className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs"
                      style={{
                        backgroundColor: hours > 0
                          ? `rgba(59, 130, 246, ${0.15 + intensity * 0.6})`
                          : "#f9fafb",
                      }}
                      title={`${day.date}: ${formatDuration(day.duration)} h`}
                    >
                      <span className="text-gray-600">{d}</span>
                      {hours > 0 && (
                        <span className="text-[10px] font-mono font-semibold text-blue-700">
                          {formatDuration(day.duration)}
                        </span>
                      )}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
