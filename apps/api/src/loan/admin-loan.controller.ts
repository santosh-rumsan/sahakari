import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types';
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
    @Request() req: AuthRequest,
    @Query('action') action: 'APPROVED' | 'REJECTED',
    @Query('reason') reason?: string,
    @Body()
    body: {
      interestRate?: number;
      paymentFrequency?:
        | 'DAILY'
        | 'WEEKLY'
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'ANNUAL';
      installments?: number;
      gracePeriod?: number;
      lateFee?: number;
    } = {},
  ) {
    return this.loan.review(id, req.user.sub, action, reason, {
      interestRate: body.interestRate,
      paymentFrequency: body.paymentFrequency,
      installments: body.installments,
      gracePeriod: body.gracePeriod,
      lateFee: body.lateFee,
    });
  }

  @Patch(':id/disburse')
  async disburse(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body()
    body: {
      disbursedAmount?: number;
      interestRate?: number;
      paymentFrequency?:
        | 'DAILY'
        | 'WEEKLY'
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'ANNUAL';
      numberOfInstallments?: number;
      gracePeriodDays?: number;
      lateFeePercentage?: number;
    } = {},
  ) {
    const loan = await this.loan.getById(id);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return this.loan.disburseLoan(id, req.user.sub, {
      disbursedAmount:
        body.disbursedAmount ?? loan.disbursedAmount ?? loan.loanAmount ?? 0,
      interestRate: body.interestRate ?? loan.interestRate ?? 15,
      paymentFrequency:
        body.paymentFrequency ?? loan.paymentFrequency ?? 'MONTHLY',
      numberOfInstallments:
        body.numberOfInstallments ?? loan.numberOfInstallments ?? 12,
      gracePeriodDays: body.gracePeriodDays ?? loan.gracePeriodDays ?? 7,
      lateFeePercentage: body.lateFeePercentage ?? loan.lateFeePercentage ?? 2,
    });
  }

  @Patch(':id/record-payment')
  async recordPayment(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body()
    body: {
      installmentNumbers: number[];
      paymentDate?: string;
    },
  ) {
    return this.loan.recordLoanPayments(
      id,
      body.installmentNumbers,
      body.paymentDate ? new Date(body.paymentDate) : new Date(),
      req.user.sub,
    );
  }

  @Patch(':id/config')
  async updateConfig(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body()
    body: {
      interestRate?: number;
      paymentFrequency?:
        | 'DAILY'
        | 'WEEKLY'
        | 'MONTHLY'
        | 'QUARTERLY'
        | 'ANNUAL';
      numberOfInstallments?: number;
      gracePeriodDays?: number;
      lateFeePercentage?: number;
    },
  ) {
    return this.loan.updateLoanConfig(id, req.user.sub, {
      interestRate: body.interestRate,
      paymentFrequency: body.paymentFrequency,
      numberOfInstallments: body.numberOfInstallments,
      gracePeriodDays: body.gracePeriodDays,
      lateFeePercentage: body.lateFeePercentage,
    });
  }
}
