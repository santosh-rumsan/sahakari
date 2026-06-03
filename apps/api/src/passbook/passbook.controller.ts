import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types';
import { PassbookService } from './passbook.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePassbookDto } from './dto/create-passbook.dto';

@ApiTags('passbook')
@Controller('passbook')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PassbookController {
  constructor(private passbook: PassbookService) {}

  @Get('me')
  getMine(@Request() req: AuthRequest) {
    // Use advanced calculation for accurate interest
    return this.passbook.getByUserId(req.user.sub);
  }

  @Get('me/transactions')
  getTransactions(@Request() req: AuthRequest) {
    return this.passbook.getTransactions(req.user.sub);
  }
}

@ApiTags('admin/passbook')
@Controller('admin/passbook')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminPassbookController {
  constructor(private passbook: PassbookService) {}

  @Post()
  create(@Body() dto: CreatePassbookDto) {
    return this.passbook.create(dto);
  }

  @Post('credit-monthly-interest')
  async creditMonthlyInterest() {
    return this.passbook.creditMonthlyInterest();
  }

  /**
   * Credit interest for specific user
   */
  @Post('credit-interest/:userId')
  async creditInterestForUser(@Param('userId') userId: string) {
    return this.passbook.creditInterestForUser(userId);
  }

  /**
   * Deposit to user's passbook
   */
  @Post('deposit/:userId')
  async deposit(
    @Param('userId') userId: string,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.passbook.deposit(userId, body.amount, body.description);
  }

  /**
   * Withdraw from user's passbook
   */
  @Post('withdraw/:userId')
  async withdraw(
    @Param('userId') userId: string,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.passbook.withdraw(userId, body.amount, body.description);
  }

  /**
   * Get transactions for a specific user
   */
  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    return this.passbook.getTransactions(userId);
  }
}
