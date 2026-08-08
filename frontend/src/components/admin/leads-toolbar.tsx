import { Search, Download } from 'lucide-react';

interface LeadsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  diagnostic: string;
  onDiagnosticChange: (value: string) => void;
  onExport: () => void;
}

/**
 * Toolbar da visão de leads: busca textual, filtro por faixa diagnóstica e
 * exportação CSV (RF-06, RF-07, US-06).
 */
export function LeadsToolbar({
  search,
  onSearchChange,
  diagnostic,
  onDiagnosticChange,
  onExport,
}: LeadsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <select
        value={diagnostic}
        onChange={(e) => onDiagnosticChange(e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas as faixas</option>
        <option value="STARTING_POINT">Starting Point</option>
        <option value="IN_CONSTRUCTION">In Construction</option>
        <option value="ON_RIGHT_TRACK">On Right Track</option>
        <option value="FINAL_STRETCH">Final Stretch</option>
      </select>

      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        <Download className="w-5 h-5" />
        <span>Exportar CSV</span>
      </button>
    </div>
  );
}
