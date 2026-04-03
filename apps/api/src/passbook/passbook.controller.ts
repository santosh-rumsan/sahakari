import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PassbookService } from './passbook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('passbook')
@Controller('passbook')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PassbookController {
  constructor(private passbook: PassbookService) {}

  @Get('me')
  getMine(@Request() req: any) {
    return this.passbook.getMine(req.user.sub);
  }

  @Get('me/transactions')
  getTransactions(@Request() req: any) {
    return this.passbook.getTransactions(req.user.sub);
  }
}
