import { useState } from 'react';
import { useLeads } from '../../hooks/use-leads';
import { LeadsToolbar } from '../../components/admin/leads-toolbar';
import { LeadsTable } from '../../components/admin/leads-table';
import { LeadDetailsModal } from '../../components/admin/lead-details-modal';
import { exportLeadsCsv } from '../../lib/export-csv';

/**
 * Página de gestão de leads (visão operacional) (RF-06, RF-07, US-06, US-07).
 * Toolbar com busca/filtro/exportação, tabela paginada e modal de detalhes.
 */
export function AdminLeads() {
  const [search, setSearch] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const { data, isLoading, error } = useLeads({ search, diagnostic, page });

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

      {isLoading && <p className="text-center text-gray-500">Carregando...</p>}

      {error && (
        <p className="text-center text-red-600">Erro ao carregar leads</p>
      )}

      {data && (
        <>
          <LeadsTable
            leads={data.leads}
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
