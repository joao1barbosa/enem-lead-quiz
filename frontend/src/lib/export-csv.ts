import { api } from './api';
import { saveAs } from 'file-saver';

interface ExportCsvParams {
  search?: string;
  diagnostic?: string;
}

/**
 * Exporta os leads filtrados (busca e faixa diagnóstica) em CSV (RF-07, US-06).
 * Baixa o arquivo `enem-lead-quiz.csv` via file-saver.
 */
export async function exportLeadsCsv({
  search = '',
  diagnostic = '',
}: ExportCsvParams): Promise<void> {
  const response = await api.get('/api/admin/leads/export', {
    params: { search, diagnostic },
    responseType: 'blob',
  });

  // Extrai o filename do header Content-Disposition
  const contentDisposition = response.headers['content-disposition'];
  const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
  const filename = filenameMatch?.[1] || 'enem-lead-quiz.csv';

  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}
