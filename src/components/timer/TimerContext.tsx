"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pauseStart: number | null;
  pausedTotal: number;
  projectId: string | null;
  taskAreaId: string | null;
  taetigkeit: string;
}

interface TimerContextType extends TimerState {
  elapsed: number;
  start: (projectId: string, taetigkeit: string, taskAreaId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  reset: () => void;
}

const STORAGE_KEY = "mimi_timer";

const defaultState: TimerState = {
  isRunning: false,
  isPaused: false,
  startTime: null,
  pauseStart: null,
  pausedTotal: 0,
  projectId: null,
  taskAreaId: null,
  taetigkeit: "",
};

const TimerContext = createContext<TimerContextType | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(defaultState);
  const [elapsed, setElapsed] = useState(0);
  const frameRef = useRef<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (state.startTime !== null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Update elapsed time
  useEffect(() => {
    function tick() {
      if (state.isRunning && !state.isPaused && state.startTime) {
        const now = Date.now();
        const total = Math.floor(
          (now - state.startTime - state.pausedTotal) / 1000
        );
        setElapsed(Math.max(0, total));
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    if (state.isRunning && !state.isPaused) {
      frameRef.current = requestAnimationFrame(tick);
    } else if (state.isPaused && state.startTime && state.pauseStart) {
      const total = Math.floor(
        (state.pauseStart - state.startTime - state.pausedTotal) / 1000
      );
      setElapsed(Math.max(0, total));
    } else {
      setElapsed(0);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [state.isRunning, state.isPaused, state.startTime, state.pauseStart, state.pausedTotal]);

  const start = useCallback(
    (projectId: string, taetigkeit: string, taskAreaId?: string) => {
      setState({
        isRunning: true,
        isPaused: false,
        startTime: Date.now(),
        pauseStart: null,
        pausedTotal: 0,
        projectId,
        taskAreaId: taskAreaId || null,
        taetigkeit,
      });
    },
    []
  );

  const pause = useCallback(() => {
    setState((s) => ({
      ...s,
      isPaused: true,
      pauseStart: Date.now(),
    }));
  }, []);

  const resume = useCallback(() => {
    setState((s) => ({
      ...s,
      isPaused: false,
      pausedTotal: s.pausedTotal + (Date.now() - (s.pauseStart || Date.now())),
      pauseStart: null,
    }));
  }, []);

  const stop = useCallback(async () => {
    if (!state.startTime || !state.projectId) return;

    const now = Date.now();
    let totalPaused = state.pausedTotal;
    if (state.isPaused && state.pauseStart) {
      totalPaused += now - state.pauseStart;
    }

    const startDate = new Date(state.startTime);
    const endDate = new Date(now);
    const duration = Math.round((now - state.startTime - totalPaused) / 1000);

    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: startDate.toISOString(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        duration,
        taetigkeit: state.taetigkeit,
        projectId: state.projectId,
        taskAreaId: state.taskAreaId,
      }),
    });

    if (!res.ok) {
      alert("Fehler beim Speichern des Zeiteintrags! Der Timer bleibt aktiv, bitte nochmal versuchen.");
      return;
    }

    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, [state]);

  const reset = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <TimerContext.Provider
      value={{ ...state, elapsed, start, pause, resume, stop, reset }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}
