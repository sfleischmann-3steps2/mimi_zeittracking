"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { useTimer } from "./TimerContext";
import { formatDuration } from "@/lib/time-utils";

interface ClientWithProjects {
  id: string;
  name: string;
  projects: { id: string; name: string }[];
}

interface TaskArea {
  id: string;
  name: string;
}

export default function Timer({ onStop }: { onStop?: () => void }) {
  const timer = useTimer();
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [taskAreas, setTaskAreas] = useState<TaskArea[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTaskAreaId, setSelectedTaskAreaId] = useState("");
  const [taetigkeit, setTaetigkeit] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.ok ? r.json() : [])
      .then(setClients)
      .catch(() => {});
    fetch("/api/task-areas")
      .then((r) => r.ok ? r.json() : [])
      .then(setTaskAreas)
      .catch(() => {});
  }, []);

  // Auto-select first client
  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const projects = selectedClient?.projects || [];

  // Auto-select first project when client changes
  useEffect(() => {
    if (projects.length > 0 && !projects.find((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const handleStart = () => {
    if (!selectedProjectId || !taetigkeit.trim()) return;
    timer.start(selectedProjectId, taetigkeit.trim(), selectedTaskAreaId || undefined);
  };

  const handleStop = async () => {
    await timer.stop();
    setTaetigkeit("");
    onStop?.();
  };

  const isActive = timer.isRunning;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Timer Display */}
      <div className="text-center mb-6">
        <div
          className={`text-5xl font-mono font-bold tabular-nums ${
            timer.isPaused
              ? "text-yellow-500"
              : isActive
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {formatDuration(timer.elapsed)}
        </div>
        {isActive && (
          <p className="text-sm text-gray-500 mt-2">
            {timer.taetigkeit}
            {timer.isPaused && " (pausiert)"}
          </p>
        )}
      </div>

      {/* Controls when NOT running */}
      {!isActive && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auftraggeber
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedProjectId("");
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
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tätigkeit
              </label>
              <input
                type="text"
                value={taetigkeit}
                onChange={(e) => setTaetigkeit(e.target.value)}
                placeholder="Was arbeitest du?"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStart();
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aufgabengebiet
              </label>
              <select
                value={selectedTaskAreaId}
                onChange={(e) => setSelectedTaskAreaId(e.target.value)}
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
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-center gap-3">
        {!isActive ? (
          <button
            onClick={handleStart}
            disabled={!selectedProjectId || !taetigkeit.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={20} /> Start
          </button>
        ) : (
          <>
            {timer.isPaused ? (
              <button
                onClick={timer.resume}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <Play size={20} /> Weiter
              </button>
            ) : (
              <button
                onClick={timer.pause}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                <Pause size={20} /> Pause
              </button>
            )}
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <Square size={20} /> Stop
            </button>
            <button
              onClick={timer.reset}
              className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              title="Verwerfen"
            >
              <RotateCcw size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
