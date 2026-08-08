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

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

/**
 * Tabela paginada de leads da visão operacional (RF-06, US-06).
 * Linhas clicáveis abrem o modal de detalhes (US-07).
 */
export function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="min-h-[400px]">
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
                  <TableCell className="px-4 py-3">{lead.diagnosticTitle}</TableCell>
                  <TableCell className="px-4 py-3">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
