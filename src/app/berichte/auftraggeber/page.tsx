"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { formatDuration, formatTime, formatDate, toDateString } from "@/lib/time-utils";

interface Client {
  id: string;
  name: string;
}

export default function AuftraggeberReport() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [from, setFrom] = useState(toDateString(firstOfMonth));
  const [to, setTo] = useState(toDateString(now));
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((data) => {
      setClients(data);
      if (data.length > 0 && !clientId) setClientId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1);
    fetch(`/api/reports?type=client&clientId=${clientId}&from=${from}&to=${toDate.toISOString()}`)
      .then((r) => r.json())
      .then(setReport)
      .finally(() => setLoading(false));
  }, [clientId, from, to]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Users size={28} /> Auftraggeber-Report
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auftraggeber</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
                <p className="text-sm text-gray-500">Auftraggeber</p>
                <p className="text-2xl font-bold text-gray-900">{report.clientName}</p>
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

          {/* By project */}
          {report.byProject.map((proj: any, i: number) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-900">{proj.name}</span>
                <span className="font-mono text-sm font-semibold text-gray-700">
                  {formatDuration(proj.duration)} h
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Datum</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Zeit</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Dauer</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Tätigkeit</th>
                  </tr>
                </thead>
                <tbody>
                  {proj.entries.map((e: any) => (
                    <tr key={e.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                        {formatDate(new Date(e.date))}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {formatTime(new Date(e.startTime))}
                        {e.endTime && ` – ${formatTime(new Date(e.endTime))}`}
                      </td>
                      <td className="px-4 py-2 font-mono">{e.duration ? formatDuration(e.duration) : "–"}</td>
                      <td className="px-4 py-2">{e.taetigkeit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

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
