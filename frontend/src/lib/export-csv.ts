import { api } from './api';

interface ExportCsvParams {
  search?: string;
  diagnostic?: string;
}

/**
 * Exporta os leads filtrados (busca e faixa diagnóstica) em CSV (RF-07, US-06).
 * Baixa o arquivo `leads-<timestamp>.csv` via blob URL.
 */
export async function exportLeadsCsv({
  search = '',
  diagnostic = '',
}: ExportCsvParams): Promise<void> {
  const response = await api.get('/api/admin/leads/export', {
    params: { search, diagnostic },
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: 'text/csv' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `leads-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
