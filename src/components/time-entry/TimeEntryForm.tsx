"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { toDateString, combineDateAndTime, calculateDuration } from "@/lib/time-utils";

interface ClientWithProjects {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

interface TaskArea {
  id: string;
  name: string;
}

export default function TimeEntryForm({ onSaved }: { onSaved?: () => void }) {
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [taskAreas, setTaskAreas] = useState<TaskArea[]>([]);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState(toDateString(new Date()));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [taskAreaId, setTaskAreaId] = useState("");
  const [taetigkeit, setTaetigkeit] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data);
        if (data.length > 0) setClientId(data[0].id);
      });
    fetch("/api/task-areas")
      .then((r) => r.json())
      .then(setTaskAreas);
  }, []);

  const selectedClient = clients.find((c) => c.id === clientId);
  const projects = selectedClient?.projects || [];

  useEffect(() => {
    if (projects.length > 0 && !projects.find((p) => p.id === projectId)) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const durationPreview = (() => {
    if (!startTime || !endTime) return null;
    const s = combineDateAndTime(date, startTime);
    const e = combineDateAndTime(date, endTime);
    if (e <= s) return null;
    const secs = calculateDuration(s, e);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}:${m.toString().padStart(2, "0")} h`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !taetigkeit.trim() || !startTime || !endTime) return;

    const start = combineDateAndTime(date, startTime);
    const end = combineDateAndTime(date, endTime);
    if (end <= start) return;

    setSaving(true);
    try {
      await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: start.toISOString(),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration: calculateDuration(start, end),
          taetigkeit: taetigkeit.trim(),
          projectId,
          taskAreaId: taskAreaId || null,
          notes: notes.trim() || null,
        }),
      });

      // Reset form
      setStartTime("");
      setEndTime("");
      setTaetigkeit("");
      setNotes("");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Manueller Eintrag
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ende
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dauer
          </label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {durationPreview || "–"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Auftraggeber
          </label>
          <select
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setProjectId("");
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Projekt
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tätigkeit
          </label>
          <input
            type="text"
            value={taetigkeit}
            onChange={(e) => setTaetigkeit(e.target.value)}
            placeholder="Was hast du gemacht?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aufgabengebiet
          </label>
          <select
            value={taskAreaId}
            onChange={(e) => setTaskAreaId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">– optional –</option>
            {taskAreas.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notizen
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !projectId || !taetigkeit.trim() || !startTime || !endTime}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={18} /> Eintrag speichern
      </button>
    </form>
  );
}
