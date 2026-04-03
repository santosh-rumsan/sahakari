import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Injectable()
export class PassbookService {
  constructor(private prisma: PrismaService) {}

  async getMine(userId: string) {
    return this.prisma.passbook.findUnique({ where: { userId } });
  }

  async getTransactions(userId: string) {
    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
    });
    if (!passbook) return [];
    return this.prisma.passbookTransaction.findMany({
      where: { passbookId: passbook.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
