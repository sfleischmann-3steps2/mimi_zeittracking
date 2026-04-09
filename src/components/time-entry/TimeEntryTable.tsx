"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import {
  formatDuration,
  formatTime,
  formatDate,
  toDateString,
  combineDateAndTime,
  calculateDuration,
} from "@/lib/time-utils";

interface TimeEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  taetigkeit: string;
  notes: string | null;
  projectId: string;
  taskAreaId: string | null;
  project: {
    id: string;
    name: string;
    clientId: string;
    client: { id: string; name: string };
  };
  taskArea: { id: string; name: string } | null;
}

interface ClientWithProjects {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

interface TaskArea {
  id: string;
  name: string;
}

interface EditState {
  date: string;
  startTime: string;
  endTime: string;
  taetigkeit: string;
  notes: string;
  clientId: string;
  projectId: string;
  taskAreaId: string;
}

export default function TimeEntryTable({
  entries,
  onDelete,
  onUpdate,
}: {
  entries: TimeEntry[];
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [taskAreas, setTaskAreas] = useState<TaskArea[]>([]);
  const [saving, setSaving] = useState(false);

  // Load dropdown data when editing starts
  useEffect(() => {
    if (editId && clients.length === 0) {
      fetch("/api/clients").then((r) => r.json()).then(setClients);
      fetch("/api/task-areas").then((r) => r.json()).then(setTaskAreas);
    }
  }, [editId, clients.length]);

  const startEdit = (entry: TimeEntry) => {
    const d = new Date(entry.date);
    const s = new Date(entry.startTime);
    const e = entry.endTime ? new Date(entry.endTime) : null;

    setEditId(entry.id);
    setEdit({
      date: toDateString(d),
      startTime: `${s.getHours().toString().padStart(2, "0")}:${s.getMinutes().toString().padStart(2, "0")}`,
      endTime: e ? `${e.getHours().toString().padStart(2, "0")}:${e.getMinutes().toString().padStart(2, "0")}` : "",
      taetigkeit: entry.taetigkeit,
      notes: entry.notes || "",
      clientId: entry.project.client.id,
      projectId: entry.projectId,
      taskAreaId: entry.taskAreaId || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEdit(null);
  };

  const saveEdit = async () => {
    if (!editId || !edit || !edit.taetigkeit.trim() || !edit.startTime) return;

    setSaving(true);
    try {
      const startDt = combineDateAndTime(edit.date, edit.startTime);
      const endDt = edit.endTime ? combineDateAndTime(edit.date, edit.endTime) : null;
      const duration = endDt ? calculateDuration(startDt, endDt) : null;

      await fetch(`/api/time-entries/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: startDt.toISOString(),
          startTime: startDt.toISOString(),
          endTime: endDt?.toISOString() || null,
          duration,
          taetigkeit: edit.taetigkeit.trim(),
          projectId: edit.projectId,
          taskAreaId: edit.taskAreaId || null,
          notes: edit.notes.trim() || null,
        }),
      });

      cancelEdit();
      onUpdate?.();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
      onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  };

  const selectedClient = clients.find((c) => c.id === edit?.clientId);
  const editProjects = selectedClient?.projects || [];

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-sm text-center">
          Keine Einträge vorhanden.
        </p>
      </div>
    );
  }

  const inputClass = "rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Zeit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Dauer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Auftraggeber</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Projekt</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tätigkeit</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Bereich</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isEditing = editId === entry.id && edit;

              if (isEditing) {
                // Duration preview
                let durationPreview = "–";
                if (edit.startTime && edit.endTime) {
                  try {
                    const s = combineDateAndTime(edit.date, edit.startTime);
                    const e = combineDateAndTime(edit.date, edit.endTime);
                    if (e > s) durationPreview = formatDuration(calculateDuration(s, e));
                  } catch {}
                }

                return (
                  <tr key={entry.id} className="border-b border-gray-100 bg-blue-50/30">
                    <td className="px-4 py-2">
                      <input type="date" value={edit.date}
                        onChange={(e) => setEdit({ ...edit, date: e.target.value })}
                        className={`${inputClass} w-[130px]`} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <input type="time" value={edit.startTime}
                          onChange={(e) => setEdit({ ...edit, startTime: e.target.value })}
                          className={`${inputClass} w-[95px]`} />
                        <span className="text-gray-400">–</span>
                        <input type="time" value={edit.endTime}
                          onChange={(e) => setEdit({ ...edit, endTime: e.target.value })}
                          className={`${inputClass} w-[95px]`} />
                      </div>
                    </td>
                    <td className="px-4 py-2 font-mono text-gray-500">{durationPreview}</td>
                    <td className="px-4 py-2">
                      <select value={edit.clientId}
                        onChange={(e) => {
                          const newClientId = e.target.value;
                          const newClient = clients.find((c) => c.id === newClientId);
                          setEdit({
                            ...edit,
                            clientId: newClientId,
                            projectId: newClient?.projects[0]?.id || "",
                          });
                        }}
                        className={`${inputClass} w-[120px]`}>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select value={edit.projectId}
                        onChange={(e) => setEdit({ ...edit, projectId: e.target.value })}
                        className={`${inputClass} w-[130px]`}>
                        {editProjects.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={edit.taetigkeit}
                        onChange={(e) => setEdit({ ...edit, taetigkeit: e.target.value })}
                        className={`${inputClass} w-full`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }} />
                      <input type="text" value={edit.notes} placeholder="Notizen..."
                        onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
                        className={`${inputClass} w-full mt-1 text-xs`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }} />
                    </td>
                    <td className="px-4 py-2">
                      <select value={edit.taskAreaId}
                        onChange={(e) => setEdit({ ...edit, taskAreaId: e.target.value })}
                        className={`${inputClass} w-[120px]`}>
                        <option value="">–</option>
                        {taskAreas.map((ta) => (
                          <option key={ta.id} value={ta.id}>{ta.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={saveEdit} disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-40"
                          title="Speichern">
                          <Check size={16} />
                        </button>
                        <button onClick={cancelEdit}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                          title="Abbrechen">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(new Date(entry.date))}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatTime(new Date(entry.startTime))}
                    {entry.endTime && ` – ${formatTime(new Date(entry.endTime))}`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono">
                    {entry.duration ? formatDuration(entry.duration) : "–"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.project.client.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {entry.project.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.taetigkeit}
                    {entry.notes && (
                      <span className="block text-xs text-gray-400 mt-0.5">
                        {entry.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {entry.taskArea?.name || "–"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => startEdit(entry)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
