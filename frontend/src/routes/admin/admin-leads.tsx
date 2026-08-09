import { useState } from 'react';
import { useLeads } from '../../hooks/use-leads';
import { useIsMobile } from '../../hooks/use-is-mobile';
import { LeadsToolbar } from '../../components/admin/leads-toolbar';
import { LeadsTable } from '../../components/admin/leads-table';
import { LeadDetailsModal } from '../../components/admin/lead-details-modal';
import { exportLeadsCsv } from '../../lib/export-csv';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/** Skeleton da tabela de leads durante fetch (1º load ou troca de página/busca). */
function LeadsTableSkeleton({ rows }: { rows: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table data-testid="leads-table-skeleton" className="w-full">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-2 md:py-3">Nome</TableHead>
              <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Email</TableHead>
              <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Telefone</TableHead>
              <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Score</TableHead>
              <TableHead className="px-4 py-2 md:py-3">Faixa</TableHead>
              <TableHead className="px-4 py-2 md:py-3 hidden md:table-cell">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 py-2 md:py-3">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="px-4 py-2 md:py-3">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-2 md:py-3 hidden md:table-cell">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Página de gestão de leads (visão operacional) (RF-06, RF-07, US-06, US-07).
 * Toolbar com busca/filtro/exportação, tabela paginada e modal de detalhes.
 */
export function AdminLeads() {
  const [search, setSearch] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const { data, isLoading, error, isFetching, refetch } = useLeads({
    search,
    diagnostic,
    page,
  });
  // Skeleton com 5 linhas no mobile, 10 no desktop (RNF-03).
  const skeletonRows = isMobile ? 5 : 10;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDiagnosticChange = (value: string) => {
    setDiagnostic(value);
    setPage(1);
  };

  const handleExport = () => {
    exportLeadsCsv({ search, diagnostic });
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;
  const start = data && data.total > 0 ? (data.page - 1) * data.limit + 1 : 0;
  const end = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leads</h1>

      <LeadsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        diagnostic={diagnostic}
        onDiagnosticChange={handleDiagnosticChange}
        onExport={handleExport}
      />

      {(isLoading || (isFetching && data)) && (
        <LeadsTableSkeleton rows={skeletonRows} />
      )}

      {error && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-destructive">Erro ao carregar leads</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      )}

      {data && !isFetching && (
        <>
          <LeadsTable
            leads={data.leads}
            hasFilters={search !== '' || diagnostic !== ''}
            onLeadClick={(lead) => setSelectedLead(lead.id)}
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Mostrando {start}-{end} de {data.total} leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}

      {selectedLead && (
        <LeadDetailsModal
          leadId={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
