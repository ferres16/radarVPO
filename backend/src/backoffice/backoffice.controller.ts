import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BackofficeService } from './backoffice.service';
import { AttachDocumentDto } from './dto/attach-document.dto';

@ApiTags('backoffice')
@Controller('backoffice')
@ApiCookieAuth('access_token')
@UseGuards(JwtAuthGuard)
@Roles('admin')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('overview')
  overview() {
    return this.backofficeService.overview();
  }

  @Get('jobs')
  jobs() {
    return this.backofficeService.jobs();
  }

  @Get('failures')
  failures() {
    return this.backofficeService.failures();
  }

  @Post('promotions/:id/documents')
  attachDocument(
    @Param('id') promotionId: string,
    @Body() dto: AttachDocumentDto,
  ) {
    return this.backofficeService.attachPromotionDocument(promotionId, dto);
  }
}
