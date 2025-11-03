import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EnterpriseWaitlistService } from './enterprise-waitlist.service';
import { CreateEnterpriseWaitlistDto } from './dto/create-enterprise-waitlist.dto';

@Controller('enterprise-waitlist')
export class EnterpriseWaitlistController {
  constructor(private readonly waitlistService: EnterpriseWaitlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateEnterpriseWaitlistDto) {
    return this.waitlistService.create(createDto);
  }
}
