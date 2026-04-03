import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(
    private prisma: PrismaService,
    private notif: NotificationService,
  ) {}

  async getMine(userId: string) {
    return this.prisma.kyc.findUnique({ where: { userId } });
  }

  async create(userId: string) {
    const existing = await this.prisma.kyc.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.kyc.create({ data: { userId } });
  }

  async updateBasicInfo(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateMandatory(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateNominee(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async updateSignature(
    userId: string,
    id: string,
    data: Partial<Prisma.KycUpdateInput>,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    return this.prisma.kyc.update({ where: { id }, data });
  }

  async submit(userId: string, id: string) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc || kyc.userId !== userId) throw new ForbiddenException();
    if (kyc.status !== 'DRAFT')
      throw new BadRequestException('KYC already submitted');

    return this.prisma.kyc.update({
      where: { id },
      data: { status: 'PENDING', submittedAt: new Date() },
    });
  }

  async listAdmin(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const where = status ? { status: status as any } : {};
    const [data, total] = await Promise.all([
      this.prisma.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              fullName: true,
              cooperative: true,
              passbookNumber: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.kyc.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.kyc.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            fullName: true,
            cooperative: true,
            passbookNumber: true,
          },
        },
      },
    });
  }

  async review(
    id: string,
    adminId: string,
    action: 'APPROVED' | 'REJECTED',
    reason?: string,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id } });
    if (!kyc) throw new NotFoundException('KYC not found');
    if (!['PENDING', 'UNDER_REVIEW'].includes(kyc.status)) {
      throw new BadRequestException('KYC cannot be reviewed in current state');
    }

    const updated = await this.prisma.kyc.update({
      where: { id },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedById: adminId,
        rejectionReason: reason,
      },
    });

    const title = action === 'APPROVED' ? 'KYC Approved' : 'KYC Rejected';
    const message =
      action === 'APPROVED'
        ? 'Your KYC has been approved. You can now apply for a loan.'
        : `Your KYC has been rejected.${reason ? ` Reason: ${reason}` : ''}`;

    await this.notif.send(kyc.userId, 'KYC_STATUS', title, message, true);

    return updated;
  }
}
