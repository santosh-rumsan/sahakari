import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PassbookService } from './passbook/passbook.service';

@ApiTags('admin/customers')
@Controller('admin/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(
    private prisma: PrismaService,
    private passbookService: PassbookService,
  ) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;

    this.logger.log(`GET /admin/customers?page=${pageNum}&limit=${limitNum}`);

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
        passbook: {
          select: {
            id: true,
            currentBalance: true,
          },
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

  @Get('recent-activities')
  async recentActivities() {
    const [newUsers, kycSubmissions, loanApplications, approvedLoans] =
      await this.prisma.$transaction([
        // Recent new members
        this.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fullName: true,
            createdAt: true,
          },
        }),
        // Recent KYC submissions
        this.prisma.kyc.findMany({
          take: 5,
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            submittedAt: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        }),
        // Recent loan applications
        this.prisma.loanApplication.findMany({
          take: 5,
          where: { submittedAt: { not: null } },
          orderBy: { submittedAt: 'desc' },
          select: {
            id: true,
            loanAmount: true,
            submittedAt: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        }),
        // Recently approved loans
        this.prisma.loanApplication.findMany({
          take: 5,
          where: { status: 'APPROVED', reviewedAt: { not: null } },
          orderBy: { reviewedAt: 'desc' },
          select: {
            id: true,
            reviewedAt: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        }),
      ]);

    // Combine and format activities
    const activities = [
      ...newUsers.map((u) => ({
        type: 'member',
        user: u.fullName || 'Anonymous User',
        action: 'New member registered',
        timestamp: u.createdAt,
      })),
      ...kycSubmissions.map((k) => ({
        type: 'kyc',
        user: k.user.fullName || 'Anonymous User',
        action: 'Submitted KYC application',
        timestamp: k.submittedAt,
      })),
      ...loanApplications.map((l) => ({
        type: 'loan',
        user: l.user.fullName || 'Anonymous User',
        action: `Applied for loan NPR ${typeof l.loanAmount === 'number' && !isNaN(l.loanAmount) ? l.loanAmount.toLocaleString() : '0'}`,
        timestamp: l.submittedAt,
      })),
      ...approvedLoans.map((a) => ({
        type: 'approval',
        user: a.user.fullName || 'Anonymous User',
        action: 'Loan approved',
        timestamp: a.reviewedAt,
      })),
    ];

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
  }

  @Get('monthly-stats')
  async monthlyStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.prisma
      .$transaction([
        // New members this month
        this.prisma.user.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        // Loans disbursed this month
        this.prisma.loanApplication.count({
          where: {
            status: 'APPROVED',
            reviewedAt: { gte: startOfMonth },
          },
        }),
        // KYC approved this month
        this.prisma.kyc.count({
          where: {
            status: 'APPROVED',
            reviewedAt: { gte: startOfMonth },
          },
        }),
        // Total loan amount disbursed
        this.prisma.loanApplication.aggregate({
          where: {
            status: 'APPROVED',
            reviewedAt: { gte: startOfMonth },
          },
          _sum: {
            loanAmount: true,
          },
        }),
      ])
      .then(([newMembers, loansDisbursed, kycApproved, loanSum]) => ({
        newMembers,
        loansDisbursed,
        kycApproved,
        totalDisbursed: loanSum._sum.loanAmount || 0,
      }));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    this.logger.log(`GET /admin/customers/${id}`);

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        passbookNumber: true,
        createdAt: true,
        cooperative: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
        kyc: {
          select: {
            status: true,
            citizenshipNumber: true,
            dob: true,
            fullNameEn: true,
            fullNameNp: true,
            genealogyJson: true,
            provinceId: true,
            districtId: true,
            municipalityId: true,
            wardNumber: true,
            tole: true,
            submittedAt: true,
            reviewedAt: true,
            rejectionReason: true,
            district: true,
            municipality: true,
          },
        },
        loanApplications: {
          select: {
            id: true,
            referenceNumber: true,
            loanAmount: true,
            purpose: true,
            duration: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
        _count: {
          select: { loanApplications: true },
        },
      },
    });

    // Get passbook with accrued interest calculation
    const passbookWithInterest = await this.passbookService.getByUserId(id);

    this.logger.log(
      `GET /admin/customers/${id} passbookAttached=${Boolean(passbookWithInterest)}`,
    );

    return {
      ...user,
      passbook: passbookWithInterest,
    };
  }
}
