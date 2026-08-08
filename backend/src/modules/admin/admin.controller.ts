import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AdminDashboardResponse,
  AdminLeadDetailsResponse,
  AdminLeadsFilter,
  AdminLeadsListResponse,
  AdminService,
} from './admin.service';

/**
 * Rotas administrativas (RF-05, RF-06, RF-07).
 * Todas protegidas por JWT (RF-08).
 */
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** KPIs e métricas do dashboard (RF-05). */
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

  /** Detalhes de um lead (RF-06). */
  @Get('leads/:id')
  getLeadDetails(@Param('id') id: string): Promise<AdminLeadDetailsResponse> {
    return this.adminService.getLeadDetails(id);
  }
}
