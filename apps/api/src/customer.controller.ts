import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@ApiTags('admin/customers')
@Controller('admin/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    return this.prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        fullName: true,
        cooperative: true,
        passbookNumber: true,
        email: true,
        createdAt: true,
        kyc: {
          select: { status: true },
        },
        _count: {
          select: { loanApplications: true },
        },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('stats')
  stats() {
    return this.prisma
      .$transaction([
        this.prisma.user.count(),
        this.prisma.kyc.count({
          where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
        }),
        this.prisma.loanApplication.count({
          where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
        }),
        this.prisma.kyc.count({ where: { status: 'APPROVED' } }),
        this.prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
        this.prisma.loanApplication.count({ where: { status: 'REJECTED' } }),
      ])
      .then(
        ([
          totalUsers,
          kycPending,
          loanPending,
          kycApproved,
          loanApproved,
          loanRejected,
        ]) => ({
          totalUsers,
          kycPending,
          loanPending,
          kycApproved,
          loanApproved,
          loanRejected,
        }),
      );
  }
}
