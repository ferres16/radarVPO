import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateInterestLeadDto } from './dto/create-interest-lead.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('interest')
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  createInterest(@Body() dto: CreateInterestLeadDto) {
    return this.leadsService.createInterest(dto);
  }
}
