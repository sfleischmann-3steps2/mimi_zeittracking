"use client";

import { useState, useEffect } from "react";
import { Tags, Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface TaskArea {
  id: string;
  name: string;
}

export default function AufgabenbereicheVerwaltung() {
  const [areas, setAreas] = useState<TaskArea[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = () =>
    fetch("/api/task-areas")
      .then((r) => r.json())
      .then(setAreas);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch("/api/task-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    load();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await fetch(`/api/task-areas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/task-areas/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <Tags size={28} /> Aufgabenbereiche
      </h1>

      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neuer Aufgabenbereich..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Plus size={16} /> Hinzufügen
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {areas.length === 0 ? (
          <p className="text-gray-500 text-sm p-6 text-center">
            Noch keine Aufgabenbereiche angelegt.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {areas.map((area) => (
              <div key={area.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                {editId === area.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(area.id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{area.name}</span>
                )}
                <div className="flex gap-1">
                  {editId === area.id ? (
                    <>
                      <button onClick={() => handleUpdate(area.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                      <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(area.id); setEditName(area.name); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(area.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
