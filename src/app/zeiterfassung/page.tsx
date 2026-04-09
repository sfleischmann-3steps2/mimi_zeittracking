import { Clock } from "lucide-react";

export default function Zeiterfassung() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Clock size={28} /> Zeiterfassung
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Timer und manuelle Eingabe kommen in Phase 2.</p>
      </div>
    </div>
  );
}
