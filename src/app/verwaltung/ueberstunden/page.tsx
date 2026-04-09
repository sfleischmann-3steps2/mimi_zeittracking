"use client";

import { useState, useEffect } from "react";
import { Clock, Plus } from "lucide-react";
import { toDateString } from "@/lib/time-utils";

interface Project {
  id: string;
  name: string;
  client: { name: string };
}

interface OvertimeRule {
  id: string;
  sollZeit: number;
  ueberstundenAktiv: boolean;
  gueltigAb: string;
  gueltigBis: string | null;
  project: Project;
}

export default function UeberstundenVerwaltung() {
  const [rules, setRules] = useState<OvertimeRule[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [projectId, setProjectId] = useState("");
  const [sollZeit, setSollZeit] = useState("");
  const [aktiv, setAktiv] = useState(true);
  const [gueltigAb, setGueltigAb] = useState(toDateString(new Date()));
  const [gueltigBis, setGueltigBis] = useState("");

  const load = () => {
    fetch("/api/overtime-rules").then((r) => r.json()).then(setRules);
    fetch("/api/projects").then((r) => r.json()).then((data) => {
      setProjects(data);
      if (data.length > 0 && !projectId) setProjectId(data[0].id);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !sollZeit) return;

    await fetch("/api/overtime-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        sollZeit: parseFloat(sollZeit),
        ueberstundenAktiv: aktiv,
        gueltigAb,
        gueltigBis: gueltigBis || null,
      }),
    });

    setSollZeit("");
    setGueltigBis("");
    setShowForm(false);
    load();
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock size={28} /> Überstunden-Regeln
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Neue Regel
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.client.name} / {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soll-Stunden (pro Monat)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={sollZeit}
                onChange={(e) => setSollZeit(e.target.value)}
                placeholder="z.B. 40"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Überstunden aktiv</label>
              <select
                value={aktiv ? "ja" : "nein"}
                onChange={(e) => setAktiv(e.target.value === "ja")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ja">Ja</option>
                <option value="nein">Nein</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gültig ab</label>
              <input
                type="date"
                value={gueltigAb}
                onChange={(e) => setGueltigAb(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis (optional)</label>
              <input
                type="date"
                value={gueltigBis}
                onChange={(e) => setGueltigBis(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!projectId || !sollZeit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {rules.length === 0 ? (
          <p className="text-gray-500 text-sm p-6 text-center">
            Noch keine Überstunden-Regeln angelegt.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Projekt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Soll-Std.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ü-Stunden</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gültig ab</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gültig bis</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const ab = new Date(rule.gueltigAb);
                const bis = rule.gueltigBis ? new Date(rule.gueltigBis) : null;
                const isActive = ab <= now && (!bis || bis >= now);

                return (
                  <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium">{rule.project.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{rule.project.client.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono">{rule.sollZeit}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        rule.ueberstundenAktiv
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {rule.ueberstundenAktiv ? "Aktiv" : "Inaktiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ab.toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {bis ? bis.toLocaleDateString("de-DE") : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {isActive ? "Aktiv" : "Abgelaufen"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
