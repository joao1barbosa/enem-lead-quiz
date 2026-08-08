import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface LeadsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  diagnostic: string;
  onDiagnosticChange: (value: string) => void;
  onExport: () => void;
}

/**
 * Valor sentinela para "Todas as faixas". O shadcn Select (Radix) não aceita
 * valores vazios em SelectItem, então mapeamos '' (sem filtro) para este valor.
 */
const ALL_DIAGNOSTICS = '__all__';

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          data-testid="lead-search"
          className="pl-10"
        />
      </div>

      <Select
        value={diagnostic === '' ? ALL_DIAGNOSTICS : diagnostic}
        onValueChange={(value) =>
          onDiagnosticChange(value === ALL_DIAGNOSTICS ? '' : value)
        }
      >
        <SelectTrigger
          data-testid="diagnostic-filter"
          className="w-full sm:w-auto sm:min-w-[180px]"
        >
          <SelectValue placeholder="Todas as faixas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_DIAGNOSTICS}>Todas as faixas</SelectItem>
          <SelectItem value="STARTING_POINT">Ponto de Partida</SelectItem>
          <SelectItem value="IN_CONSTRUCTION">Em Construção</SelectItem>
          <SelectItem value="ON_RIGHT_TRACK">Na Trilha Certa</SelectItem>
          <SelectItem value="FINAL_STRETCH">Reta Final</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onExport} data-testid="export-csv">
        <Download />
        <span>Exportar CSV</span>
      </Button>
    </div>
  );
}
