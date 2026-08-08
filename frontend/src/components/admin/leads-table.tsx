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

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

// Mapeamento de slug para variante do badge
const DIAGNOSTIC_BADGE_VARIANT: Record<string, 'diagnostic-starting' | 'diagnostic-construction' | 'diagnostic-track' | 'diagnostic-stretch'> = {
  STARTING_POINT: 'diagnostic-starting',
  IN_CONSTRUCTION: 'diagnostic-construction',
  ON_RIGHT_TRACK: 'diagnostic-track',
  FINAL_STRETCH: 'diagnostic-stretch',
};

export function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  const MAX_ROWS = 10;
  const ROW_HEIGHT = 46; // px por linha (py-3 + conteúdo)
  const HEADER_HEIGHT = 46; // px do header
  const TABLE_HEIGHT = HEADER_HEIGHT + MAX_ROWS * ROW_HEIGHT; // 506px

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
                  <TableCell className="px-4 py-3">{lead.phone}</TableCell>
                  <TableCell className="px-4 py-3">{lead.score}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant={DIAGNOSTIC_BADGE_VARIANT[lead.diagnosticSlug] || 'outline'}>
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
