import type { Lead } from '../../hooks/use-leads';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/lib/format-phone';

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  /** Indica se há filtros ativos (busca/faixa) para a mensagem de empty state. */
  hasFilters?: boolean;
}

// Mapeamento de slug para classes do badge (usando cores do tailwind.config.ts)
const DIAGNOSTIC_BADGE_CLASSES: Record<string, string> = {
  STARTING_POINT: 'bg-diagnostic-starting/80 text-white border-diagnostic-starting rounded-full hover:bg-diagnostic-starting/80',
  IN_CONSTRUCTION: 'bg-diagnostic-construction/80 text-white border-diagnostic-construction rounded-full hover:bg-diagnostic-construction/80',
  ON_RIGHT_TRACK: 'bg-diagnostic-track/80 text-white border-diagnostic-track rounded-full hover:bg-diagnostic-track/80',
  FINAL_STRETCH: 'bg-diagnostic-stretch/80 text-white border-diagnostic-stretch rounded-full hover:bg-diagnostic-stretch/80',
};

export function LeadsTable({ leads, onLeadClick, hasFilters }: LeadsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
          <Table data-testid="leads-table" className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-2 md:py-3 w-full">Nome</TableHead>
                <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Email</TableHead>
                <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Telefone</TableHead>
                <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Score</TableHead>
                <TableHead className="px-4 py-2 md:py-3 w-auto">Faixa</TableHead>
                <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {hasFilters
                      ? 'Nenhum lead encontrado com os filtros aplicados'
                      : 'Nenhum lead encontrado'}
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    onClick={() => onLeadClick(lead)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell className="px-4 py-2 md:py-3 w-full max-w-0 truncate whitespace-nowrap">{lead.name}</TableCell>
                    <TableCell className="px-4 py-2 md:py-3 max-w-[240px] truncate hidden md:table-cell">{lead.email}</TableCell>
                    <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">{formatPhone(lead.phone)}</TableCell>
                    <TableCell className="px-4 py-2 md:py-3 text-center hidden md:table-cell">{lead.score}</TableCell>
                    <TableCell className="px-4 py-2 md:py-3 w-auto flex justify-center">
                      <Badge className={DIAGNOSTIC_BADGE_CLASSES[lead.diagnosticSlug] || 'bg-gray-100/80 text-gray-800 border-gray-300 rounded-full'}>
                        {lead.diagnosticTitle}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}
