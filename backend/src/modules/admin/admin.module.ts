import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { CsvExportService } from './csv-export.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, CsvExportService],
})
export class AdminModule {}
