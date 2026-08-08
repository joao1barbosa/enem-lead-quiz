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
}

// Mapeamento de slug para classes do badge (usando cores do tailwind.config.ts)
const DIAGNOSTIC_BADGE_CLASSES: Record<string, string> = {
  STARTING_POINT: 'bg-diagnostic-starting/80 text-white border-diagnostic-starting rounded-full hover:bg-diagnostic-starting/80',
  IN_CONSTRUCTION: 'bg-diagnostic-construction/80 text-white border-diagnostic-construction rounded-full hover:bg-diagnostic-construction/80',
  ON_RIGHT_TRACK: 'bg-diagnostic-track/80 text-white border-diagnostic-track rounded-full hover:bg-diagnostic-track/80',
  FINAL_STRETCH: 'bg-diagnostic-stretch/80 text-white border-diagnostic-stretch rounded-full hover:bg-diagnostic-stretch/80',
};

export function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  const MAX_ROWS = 10;
  const ROW_HEIGHT = 50; // px por linha (py-3 + conteúdo)
  const HEADER_HEIGHT = 46; // px do header
  const TABLE_HEIGHT = HEADER_HEIGHT + MAX_ROWS * ROW_HEIGHT; // 546px

  return (
    <Card className="overflow-hidden" style={{ height: `${TABLE_HEIGHT}px` }}>
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <Table data-testid="leads-table">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3">Nome</TableHead>
                <TableHead className="px-4 py-3">Email</TableHead>
                <TableHead className="px-4 py-3">Telefone</TableHead>
                <TableHead className="px-4 py-3">Score</TableHead>
                <TableHead className="px-4 py-3">Faixa</TableHead>
                <TableHead className="px-4 py-3">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell className="px-4 py-3">{lead.name}</TableCell>
                  <TableCell className="px-4 py-3 max-w-[240px] truncate">{lead.email}</TableCell>
                  <TableCell className="px-4 py-3">{formatPhone(lead.phone)}</TableCell>
                  <TableCell className="px-4 py-3 text-center">{lead.score}</TableCell>
                  <TableCell className="px-4 py-3 flex justify-center">
                    <Badge className={DIAGNOSTIC_BADGE_CLASSES[lead.diagnosticSlug] || 'bg-gray-100/80 text-gray-800 border-gray-300 rounded-full'}>
                      {lead.diagnosticTitle}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Espaço vazio com fundo diferenciado quando há menos de 10 registros */}
          {leads.length < MAX_ROWS && <div className="bg-muted/20 flex-1" />}
        </div>
      </CardContent>
    </Card>
  );
}
