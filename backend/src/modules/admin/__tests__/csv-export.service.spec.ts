import { describe, it, expect } from 'vitest';
import { CsvExportService } from '../csv-export.service';

interface CsvLeadRow {
  name: string;
  email: string;
  phone: string;
  diagnosticTitle: string;
  score: number;
  createdAt: Date;
}

describe('CsvExportService (RF-07)', () => {
  let service: CsvExportService;

  beforeEach(() => {
    service = new CsvExportService();
  });

  it('should emit header with columns Nome,E-mail,Telefone,Faixa,Pontuação,Data', () => {
    const csv = service.generate([]);

    expect(csv.split('\n')[0]).toBe(
      'Nome,E-mail,Telefone,Faixa,Pontuação,Data',
    );
  });

  it('should render one row per lead with formatted fields', () => {
    const rows: CsvLeadRow[] = [
      {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        diagnosticTitle: 'Na Trilha Certa',
        score: 75,
        createdAt: new Date('2026-08-01T10:00:00.000Z'),
      },
    ];

    const csv = service.generate(rows);

    expect(csv).toContain(
      'João Silva,joao@email.com,11999999999,Na Trilha Certa,75,2026-08-01',
    );
  });

  it('should quote fields containing comma, quote or newline', () => {
    const rows: CsvLeadRow[] = [
      {
        name: 'Silva, João',
        email: 'joao@email.com',
        phone: '11999999999',
        diagnosticTitle: 'Em Construção',
        score: 30,
        createdAt: new Date('2026-08-01T10:00:00.000Z'),
      },
    ];

    const csv = service.generate(rows);

    expect(csv).toContain('"Silva, João",joao@email.com');
  });

  it('should format date as YYYY-MM-DD', () => {
    const rows: CsvLeadRow[] = [
      {
        name: 'Maria',
        email: 'maria@email.com',
        phone: '11988888888',
        diagnosticTitle: 'Reta Final',
        score: 90,
        createdAt: new Date('2026-08-05T23:30:00.000Z'),
      },
    ];

    const csv = service.generate(rows);

    expect(csv).toContain('Maria,maria@email.com,11988888888,Reta Final,90,2026-08-05');
  });
});
