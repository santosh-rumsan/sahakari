import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoanService } from './loan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin/loans')
@Controller('admin/loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminLoanController {
  constructor(private loan: LoanService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loan.listAdmin({
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.loan.getById(id);
  }

  @Patch(':id/review')
  review(
    @Param('id') id: string,
    @Request() req: any,
    @Query('action') action: 'APPROVED' | 'REJECTED',
    @Query('reason') reason?: string,
  ) {
    return this.loan.review(id, req.user.sub, action, reason);
  }
}
