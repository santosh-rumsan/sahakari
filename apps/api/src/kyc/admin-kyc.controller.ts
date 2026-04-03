import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin/kyc')
@Controller('admin/kyc')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminKycController {
  constructor(private kyc: KycService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.kyc.listAdmin({
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.kyc.getById(id);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Request() req: any,
    @Query('action') action: 'APPROVED' | 'REJECTED',
    @Query('reason') reason?: string,
  ) {
    return this.kyc.review(id, req.user.sub, action, reason);
  }
}
