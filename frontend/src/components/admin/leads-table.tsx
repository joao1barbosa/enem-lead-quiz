import type { Lead } from '../../hooks/use-leads';

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
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nome</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Telefone</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Faixa</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => onLeadClick(lead)}
              className="border-b hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-4 py-3 text-sm">{lead.name}</td>
              <td className="px-4 py-3 text-sm">{lead.email}</td>
              <td className="px-4 py-3 text-sm">{lead.phone}</td>
              <td className="px-4 py-3 text-sm">{lead.score}</td>
              <td className="px-4 py-3 text-sm">{lead.diagnosticTitle}</td>
              <td className="px-4 py-3 text-sm">
                {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
