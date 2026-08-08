import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportLeadsCsv } from '../export-csv';
import * as api from '../api';

describe('exportLeadsCsv', () => {
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    // jsdom não implementa createObjectURL/revokeObjectURL
    createObjectURL = vi.fn(() => 'blob:mock-url');
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
  });

  it('should request the export endpoint with search and diagnostic filters', async () => {
    const getSpy = vi
      .spyOn(api.api, 'get')
      .mockResolvedValue({ data: new Blob(['a,b,c'], { type: 'text/csv' }) });

    await exportLeadsCsv({ search: 'joao', diagnostic: 'ON_RIGHT_TRACK' });

    expect(getSpy).toHaveBeenCalledWith('/api/admin/leads/export', {
      params: { search: 'joao', diagnostic: 'ON_RIGHT_TRACK' },
      responseType: 'blob',
    });
  });

  it('should trigger a CSV file download and revoke the object URL', async () => {
    const blob = new Blob(['conteudo'], { type: 'text/csv' });
    vi.spyOn(api.api, 'get').mockResolvedValue({ data: blob });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, 'createElement');

    await exportLeadsCsv({ search: '', diagnostic: '' });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    const anchor = createElementSpy.mock.results
      .map((result) => result.value)
      .find((el) => el.tagName === 'A');
    expect(anchor).toBeDefined();
    expect(anchor.download).toMatch(/^leads-\d+\.csv$/);
    expect(anchor.href).toBe('blob:mock-url');
  });
});
