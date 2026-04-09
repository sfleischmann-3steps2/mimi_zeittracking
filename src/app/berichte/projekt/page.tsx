"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { formatDuration, formatTime, formatDate, toDateString } from "@/lib/time-utils";

interface Project {
  id: string;
  name: string;
  client: { name: string };
}

export default function ProjektReport() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [from, setFrom] = useState(toDateString(firstOfMonth));
  const [to, setTo] = useState(toDateString(now));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((data) => {
      setProjects(data);
      if (data.length > 0 && !projectId) setProjectId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1);
    fetch(`/api/reports?type=project&projectId=${projectId}&from=${from}&to=${toDate.toISOString()}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [projectId, from, to]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <FolderOpen size={28} /> Projekt-Report
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.client.name} / {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Von</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <p className="text-sm text-gray-500">{report.clientName}</p>
                <p className="text-2xl font-bold text-gray-900">{report.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gesamtzeit</p>
                <p className="text-3xl font-bold text-gray-900">{formatDuration(report.totalDuration)} h</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Einträge</p>
                <p className="text-3xl font-bold text-gray-900">{report.entryCount}</p>
              </div>
            </div>
          </div>

          {/* By task area */}
          {report.byTaskArea.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Nach Aufgabenbereich</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {report.byTaskArea.map((area: any, i: number) => {
                  const pct = report.totalDuration > 0
                    ? (area.duration / report.totalDuration) * 100
                    : 0;
                  return (
                    <div key={i} className="px-4 py-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{area.name}</span>
                        <span className="text-sm font-mono text-gray-700">{formatDuration(area.duration)} h</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Entries */}
          {report.entries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Alle Einträge</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Datum</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Zeit</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Dauer</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Tätigkeit</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Bereich</th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.map((e: any) => (
                    <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">{formatDate(new Date(e.date))}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatTime(new Date(e.startTime))}
                        {e.endTime && ` – ${formatTime(new Date(e.endTime))}`}
                      </td>
                      <td className="px-4 py-2 font-mono">{e.duration ? formatDuration(e.duration) : "–"}</td>
                      <td className="px-4 py-2">{e.taetigkeit}</td>
                      <td className="px-4 py-2 text-gray-500">{e.taskArea?.name || "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {report.entryCount === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-sm text-center">Keine Einträge im gewählten Zeitraum.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
