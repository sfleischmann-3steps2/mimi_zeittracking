"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { toDateString, formatDuration, formatTime } from "@/lib/time-utils";

export default function Tagesreport() {
  const [date, setDate] = useState(toDateString(new Date()));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=daily&date=${date}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar size={28} /> Tagesreport
        </h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                <p className="text-sm text-gray-500">Einträge</p>
                <p className="text-3xl font-bold text-gray-900">
                  {report.entries.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projekte</p>
                <p className="text-3xl font-bold text-gray-900">
                  {report.byProject.length}
                </p>
              </div>
            </div>
          </div>

          {/* By project */}
          {report.byProject.length > 0 && (
            <div className="space-y-4">
              {report.byProject.map((proj: any, i: number) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-900">{proj.name}</span>
                      <span className="text-gray-400 text-sm ml-2">{proj.client}</span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-gray-700">
                      {formatDuration(proj.duration)} h
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {proj.entries.map((entry: any) => (
                        <tr key={entry.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2 text-gray-600 whitespace-nowrap w-32">
                            {formatTime(new Date(entry.startTime))}
                            {entry.endTime && ` – ${formatTime(new Date(entry.endTime))}`}
                          </td>
                          <td className="px-4 py-2 font-mono text-gray-500 w-20">
                            {entry.duration ? formatDuration(entry.duration) : "–"}
                          </td>
                          <td className="px-4 py-2">{entry.taetigkeit}</td>
                          <td className="px-4 py-2 text-gray-400 text-xs">
                            {entry.taskArea?.name || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {report.entries.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-sm text-center">
                Keine Einträge für diesen Tag.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
