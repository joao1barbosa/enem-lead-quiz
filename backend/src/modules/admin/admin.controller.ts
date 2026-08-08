import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminDashboardResponse, AdminService } from './admin.service';

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
}
