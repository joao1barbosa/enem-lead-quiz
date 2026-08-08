import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AdminDashboardResponse,
  AdminLeadDetailsResponse,
  AdminLeadsFilter,
  AdminLeadsListResponse,
  AdminService,
} from './admin.service';
import { CsvExportService } from './csv-export.service';

/**
 * Rotas administrativas (RF-05, RF-06, RF-07).
 * Todas protegidas por JWT (RF-08).
 */
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly csvExportService: CsvExportService,
  ) {}

  /** KPIs e métricas do dashboard (RF-05): total/qualificados, média, faixas e leads dos últimos 7 dias. */
  @Get('dashboard')
  getDashboard(): Promise<AdminDashboardResponse> {
    return this.adminService.getDashboard();
  }

  /** Lista paginada de leads (RF-05). */
  @Get('leads')
  getLeads(
    @Query('search') search?: string,
    @Query('diagnostic') diagnostic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<AdminLeadsListResponse> {
    const filter: AdminLeadsFilter = {
      search,
      diagnostic,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.adminService.getLeads(filter);
  }

  /** Exportação CSV de leads filtrados (RF-07). */
  @Get('leads/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportLeads(
    @Query('search') search?: string,
    @Query('diagnostic') diagnostic?: string,
    @Res({ passthrough: true }) res?: Response,
  ): Promise<string> {
    const leads = await this.adminService.getLeadsForExport({
      search,
      diagnostic,
    });
    const csv = this.csvExportService.generate(leads);

    res?.setHeader(
      'Content-Disposition',
      `attachment; filename="enem-lead-quiz.csv"`,
    );
    return csv;
  }

  /** Detalhes de um lead (RF-06). */
  @Get('leads/:id')
  getLeadDetails(@Param('id') id: string): Promise<AdminLeadDetailsResponse> {
    return this.adminService.getLeadDetails(id);
  }
}
