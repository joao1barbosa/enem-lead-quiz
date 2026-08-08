import { Injectable } from '@nestjs/common';

export interface CsvLeadRow {
  name: string;
  email: string;
  phone: string;
  diagnosticTitle: string;
  score: number;
  createdAt: Date;
}

/**
 * Geração de CSV de leads (RF-07).
 *
 * Colunas: Nome, E-mail, Telefone, Faixa, Pontuação, Data.
 * Campos contendo vírgula, aspas ou quebra de linha são escapados com aspas.
 */
@Injectable()
export class CsvExportService {
  private readonly header = 'Nome,E-mail,Telefone,Faixa,Pontuação,Data';

  generate(leads: CsvLeadRow[]): string {
    const rows = leads.map((lead) =>
      [
        this.escape(lead.name),
        this.escape(lead.email),
        this.escape(lead.phone),
        this.escape(lead.diagnosticTitle),
        String(lead.score),
        this.formatDate(lead.createdAt),
      ].join(','),
    );

    return [this.header, ...rows].join('\n');
  }

  private escape(value: string): string {
    const needsQuotes = /[",\n\r]/.test(value);
    if (!needsQuotes) {
      return value;
    }
    return `"${value.replace(/"/g, '""')}"`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
