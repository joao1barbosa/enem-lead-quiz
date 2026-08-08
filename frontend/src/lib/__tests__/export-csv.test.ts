import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { exportLeadsCsv } from '../export-csv';
import * as api from '../api';
import { saveAs } from 'file-saver';

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('exportLeadsCsv', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should request the export endpoint with search and diagnostic filters', async () => {
    const getSpy = vi
      .spyOn(api.api, 'get')
      .mockResolvedValue({
        data: new Blob(['a,b,c'], { type: 'text/csv' }),
        headers: { 'content-disposition': 'attachment; filename="enem-lead-quiz.csv"' },
      });

    await exportLeadsCsv({ search: 'joao', diagnostic: 'ON_RIGHT_TRACK' });

    expect(getSpy).toHaveBeenCalledWith('/api/admin/leads/export', {
      params: { search: 'joao', diagnostic: 'ON_RIGHT_TRACK' },
      responseType: 'blob',
    });
  });

  it('should trigger a CSV file download with correct filename', async () => {
    const blob = new Blob(['conteudo'], { type: 'text/csv' });
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="enem-lead-quiz.csv"' },
    });

    await exportLeadsCsv({ search: '', diagnostic: '' });

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'enem-lead-quiz.csv');
  });

  it('should create the Blob with UTF-8 CSV MIME type', async () => {
    const blob = new Blob(['conteudo'], { type: 'text/csv;charset=utf-8;' });
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="enem-lead-quiz.csv"' },
    });

    await exportLeadsCsv({ search: '', diagnostic: '' });

    const blobArg = (saveAs as unknown as Mock).mock.calls[0][0] as Blob;
    expect(blobArg.type).toBe('text/csv;charset=utf-8;');
  });

  it('should extract filename from Content-Disposition header', async () => {
    const blob = new Blob(['conteudo'], { type: 'text/csv' });
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="custom-name.csv"' },
    });

    await exportLeadsCsv({ search: '', diagnostic: '' });

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'custom-name.csv');
  });

  it('should fallback to default filename if header is missing', async () => {
    const blob = new Blob(['conteudo'], { type: 'text/csv' });
    vi.spyOn(api.api, 'get').mockResolvedValue({
      data: blob,
      headers: {},
    });

    await exportLeadsCsv({ search: '', diagnostic: '' });

    expect(saveAs).toHaveBeenCalledWith(expect.any(Blob), 'enem-lead-quiz.csv');
  });
});
