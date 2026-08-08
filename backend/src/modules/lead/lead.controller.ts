import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { LeadService } from './lead.service';

@Controller('api/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  /** Cria um lead (201) ou rejeita e-mail duplicado (409) (RF-03/RF-04). */
  @Post()
  create(@Body() dto: CreateLeadDto): Promise<LeadResponseDto> {
    return this.leadService.create(dto);
  }
}
