import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePassbookDto } from './dto/create-passbook.dto';

@Injectable()
export class PassbookService {
  private readonly logger = new Logger(PassbookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate interest based on DAILY AVERAGE BALANCE
   * This is more accurate when there are deposits/withdrawals during the month
   */
  private async calculateAccruedInterestAdvanced(
    passbookId: string,
    annualRate: number,
    fromDate: Date,
  ): Promise<number> {
    const now = new Date();
    const passbook = await this.prisma.passbook.findUnique({
      where: { id: passbookId },
    });

    if (!passbook) {
      return 0;
    }

    // Get all transactions since fromDate
    const transactions = await this.prisma.passbookTransaction.findMany({
      where: {
        passbookId,
        createdAt: {
          gte: fromDate,
          lte: now,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no transactions, use current balance for entire period
    if (transactions.length === 0) {
      const daysPassed = Math.floor(
        (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      const accruedInterest =
        (passbook.currentBalance * annualRate * daysPassed) / (365 * 100);

      this.logger.log(
        `[interest/no-transactions] passbookId=${passbookId}, principal=${passbook.currentBalance}, annualRate=${annualRate}, daysPassed=${daysPassed}, accruedInterest=${accruedInterest}`,
      );

      return Math.round(accruedInterest * 100) / 100;
    }

    // Calculate interest for each period between transactions
    let totalInterest = 0;
    const firstTx = transactions[0];
    let currentBalance = firstTx.balanceAfter - firstTx.amount; // Balance before first transaction
    // For backfilled/seeded data, first transaction can be later than passbook start.
    // In that case use opening balance from fromDate as principal.
    if (
      firstTx.createdAt.getTime() > fromDate.getTime() &&
      passbook.openingBalance > 0
    ) {
      currentBalance = passbook.openingBalance;
    }
    let periodStart = fromDate;

    for (const tx of transactions) {
      const periodEnd = tx.createdAt;
      const daysInPeriod = Math.floor(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysInPeriod > 0 && currentBalance > 0) {
        const periodInterest =
          (currentBalance * annualRate * daysInPeriod) / (365 * 100);
        totalInterest += periodInterest;

        this.logger.debug(
          `Period: ${daysInPeriod} days, Balance: ${currentBalance}, Interest: ${periodInterest}`,
        );
      }

      currentBalance = tx.balanceAfter;
      periodStart = periodEnd;
    }

    // Add interest for period after last transaction until now
    const finalDays = Math.floor(
      (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (finalDays > 0 && currentBalance > 0) {
      const finalInterest =
        (currentBalance * annualRate * finalDays) / (365 * 100);
      totalInterest += finalInterest;

      this.logger.debug(
        `Final period: ${finalDays} days, Balance: ${currentBalance}, Interest: ${finalInterest}`,
      );
    }

    return Math.round(totalInterest * 100) / 100;
  }

  /**
   * Simple interest calculation for display (used in getMine)
   * Uses current balance only - faster but less accurate
   */
  // private calculateAccruedInterest(
  //   balance: number,
  //   annualRate: number,
  //   fromDate: Date,
  // ): number {
  //   const now = new Date();
  //   const daysPassed = Math.max(
  //     0,
  //     Math.floor((now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)),
  //   );

  //   // Simple interest: (Principal × Rate × Days) / (365 × 100)
  //   const accruedInterest = (balance * annualRate * daysPassed) / (365 * 100);

  //   return Math.round(accruedInterest * 100) / 100;
  // }

  /**
   * Get the start date for interest calculation
   */
  private getInterestCalculationStartDate(passbook: {
    createdAt: Date;
    lastInterestCreditedAt: Date | null;
  }): Date {
    // If interest was credited before, start from that date
    // Otherwise start from passbook creation
    return passbook.lastInterestCreditedAt || passbook.createdAt;
  }

  /**
   * Get current month in YYYY-MM format
   */
  private getCurrentMonthString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get passbook with accrued interest (for current user)
   * Uses simple calculation for faster response
   */
  // async getMine(userId: string) {
  //   const passbook = await this.prisma.passbook.findUnique({
  //     where: { userId },
  //   });

  //   if (!passbook) {
  //     return null;
  //   }

  //   const interestStartDate = this.getInterestCalculationStartDate(passbook);

  //   // Calculate accrued interest on current balance (simple method for speed)
  //   const accruedInterest = this.calculateAccruedInterest(
  //     passbook.currentBalance,
  //     passbook.interestRateSavings,
  //     interestStartDate,
  //   );

  //   const now = new Date();
  //   const daysSinceLastCredit = Math.floor(
  //     (now.getTime() - interestStartDate.getTime()) / (1000 * 60 * 60 * 24),
  //   );

  //   return {
  //     ...passbook,
  //     accruedInterest,
  //     interestPeriodDays: daysSinceLastCredit,
  //     interestCalculatedFrom: interestStartDate,
  //   };
  // }

  /**
   * Get passbook by user ID (for admin)
   * Uses advanced calculation for accuracy
   */
  async getByUserId(userId: string) {
    this.logger.log(`[getByUserId] start userId=${userId}`);

    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            passbookNumber: true,
          },
        },
      },
    });

    if (!passbook) {
      this.logger.log(`[getByUserId] no passbook found for userId=${userId}`);
      return null;
    }

    const interestStartDate = this.getInterestCalculationStartDate(passbook);
    const accruedInterest = await this.calculateAccruedInterestAdvanced(
      passbook.id,
      passbook.interestRateSavings,
      interestStartDate,
    );

    const now = new Date();
    const daysSinceLastCredit = Math.floor(
      (now.getTime() - interestStartDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    this.logger.log(
      `[getByUserId] userId=${userId}, passbookId=${passbook.id}, currentBalance=${passbook.currentBalance}, accruedInterest=${accruedInterest}, interestPeriodDays=${daysSinceLastCredit}`,
    );

    return {
      ...passbook,
      accruedInterest,
      interestPeriodDays: daysSinceLastCredit,
      interestCalculatedFrom: interestStartDate,
    };
  }

  /**
   * Get all transactions for a user's passbook
   */
  async getTransactions(userId: string) {
    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
    });

    if (!passbook) {
      return [];
    }

    return this.prisma.passbookTransaction.findMany({
      where: { passbookId: passbook.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create new passbook for a user
   */
  async create(dto: CreatePassbookDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingPassbook = await this.prisma.passbook.findUnique({
      where: { userId: dto.userId },
    });

    if (existingPassbook) {
      throw new ConflictException('Passbook already exists for this user');
    }

    const openingBalance = dto.openingBalance || 0;

    return this.prisma.$transaction(async (tx) => {
      const passbook = await tx.passbook.create({
        data: {
          userId: dto.userId,
          openingBalance: openingBalance,
          currentBalance: openingBalance,
          totalSavings: openingBalance,
          interestRateSavings: dto.interestRateSavings ?? 5,
          interestRateLoan: dto.interestRateLoan ?? 15,
        },
      });

      if (openingBalance > 0) {
        await tx.passbookTransaction.create({
          data: {
            passbookId: passbook.id,
            type: 'DEPOSIT',
            amount: openingBalance,
            description: 'Opening balance deposit',
            balanceAfter: openingBalance,
          },
        });
      }

      return tx.passbook.findUnique({
        where: { id: passbook.id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              passbookNumber: true,
            },
          },
        },
      });
    });
  }

  /**
   * Deposit money to passbook
   */
  async deposit(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new ConflictException('Amount must be greater than 0');
    }

    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
    });

    if (!passbook) {
      throw new NotFoundException('Passbook not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const newBalance = passbook.currentBalance + amount;

      await tx.passbookTransaction.create({
        data: {
          passbookId: passbook.id,
          type: 'DEPOSIT',
          amount,
          description: description || 'Deposit',
          balanceAfter: newBalance,
        },
      });

      return tx.passbook.update({
        where: { id: passbook.id },
        data: {
          currentBalance: newBalance,
          totalSavings: { increment: amount },
        },
      });
    });
  }

  /**
   * Withdraw money from passbook
   */
  async withdraw(userId: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new ConflictException('Amount must be greater than 0');
    }

    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
    });

    if (!passbook) {
      throw new NotFoundException('Passbook not found');
    }

    if (passbook.currentBalance < amount) {
      throw new ConflictException('Insufficient balance');
    }

    return this.prisma.$transaction(async (tx) => {
      const newBalance = passbook.currentBalance - amount;

      await tx.passbookTransaction.create({
        data: {
          passbookId: passbook.id,
          type: 'WITHDRAWAL',
          amount: -amount, // Negative for withdrawal
          description: description || 'Withdrawal',
          balanceAfter: newBalance,
        },
      });

      return tx.passbook.update({
        where: { id: passbook.id },
        data: {
          currentBalance: newBalance,
          totalWithdrawals: { increment: amount },
        },
      });
    });
  }

  /**
   * Monthly interest credit with accurate calculation
   * Uses advanced method based on daily average balance
   */
  async creditMonthlyInterest(): Promise<{
    processed: number;
    skipped: number;
    failed: number;
    errors: any[];
  }> {
    const currentMonth = this.getCurrentMonthString();
    this.logger.log(`Starting monthly interest credit for ${currentMonth}`);

    const passbooks = await this.prisma.passbook.findMany({
      where: {
        OR: [
          { lastInterestMonth: null },
          { lastInterestMonth: { not: currentMonth } },
        ],
        interestRateSavings: { gt: 0 },
        currentBalance: { gt: 0 },
      },
      include: {
        user: {
          select: { id: true, fullName: true },
        },
      },
    });

    this.logger.log(`Found ${passbooks.length} passbooks to process`);

    let processed = 0;
    let skipped = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const passbook of passbooks) {
      try {
        const interestStartDate =
          this.getInterestCalculationStartDate(passbook);

        // Use advanced calculation for monthly credit
        const monthlyInterest = await this.calculateAccruedInterestAdvanced(
          passbook.id,
          passbook.interestRateSavings,
          interestStartDate,
        );

        if (monthlyInterest <= 0) {
          skipped++;
          this.logger.log(
            `Skipped userId=${passbook.userId} - no interest to credit`,
          );
          continue;
        }

        const now = new Date();

        await this.prisma.$transaction(async (tx) => {
          await tx.passbookTransaction.create({
            data: {
              passbookId: passbook.id,
              type: 'INTEREST_CREDIT',
              amount: monthlyInterest,
              description: `Monthly interest credit for ${currentMonth}`,
              balanceAfter: passbook.currentBalance + monthlyInterest,
            },
          });

          await tx.passbook.update({
            where: { id: passbook.id },
            data: {
              currentBalance: { increment: monthlyInterest },
              totalSavings: { increment: monthlyInterest },
              lastInterestCreditedAt: now,
              lastInterestMonth: currentMonth,
            },
          });
        });

        processed++;
        this.logger.log(
          `✅ Credited NPR ${monthlyInterest} to userId=${passbook.userId}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failed++;
        errors.push({
          userId: passbook.userId,
          userName: passbook.user.fullName,
          error: message,
        });
        this.logger.error(
          `❌ Failed to credit interest for userId=${passbook.userId}: ${message}`,
        );
      }
    }

    this.logger.log(
      `Completed: ${processed} processed, ${skipped} skipped, ${failed} failed`,
    );

    return { processed, skipped, failed, errors };
  }

  /**
   * Credit interest for a specific user (manual trigger)
   */
  async creditInterestForUser(userId: string): Promise<{
    transaction: {
      id: string;
      passbookId: string;
      type: string;
      amount: number;
      description: string;
      balanceAfter: number;
      createdAt: Date;
      updatedAt: Date;
    };
    passbook: {
      id: string;
      userId: string;
      currentBalance: number;
      totalSavings: number;
      lastInterestCreditedAt: Date | null;
      lastInterestMonth: string | null;
      interestRateSavings: number;
      openingBalance: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }> {
    const passbook = await this.prisma.passbook.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!passbook) {
      throw new NotFoundException('Passbook not found');
    }

    const currentMonth = this.getCurrentMonthString();

    if (passbook.lastInterestMonth === currentMonth) {
      throw new ConflictException(
        `Interest already credited for ${currentMonth}`,
      );
    }

    const interestStartDate = this.getInterestCalculationStartDate(passbook);
    const monthlyInterest = await this.calculateAccruedInterestAdvanced(
      passbook.id,
      passbook.interestRateSavings,
      interestStartDate,
    );

    if (monthlyInterest <= 0) {
      throw new ConflictException('No interest to credit');
    }

    const now = new Date();

    // @ts-expect-error - transaction object is missing updatedAt field but it's not needed for this operation
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.passbookTransaction.create({
        data: {
          passbookId: passbook.id,
          type: 'INTEREST_CREDIT',
          amount: monthlyInterest,
          description: `Manual interest credit for ${currentMonth}`,
          balanceAfter: passbook.currentBalance + monthlyInterest,
        },
      });

      const updatedPassbook = await tx.passbook.update({
        where: { id: passbook.id },
        data: {
          currentBalance: { increment: monthlyInterest },
          totalSavings: { increment: monthlyInterest },
          lastInterestCreditedAt: now,
          lastInterestMonth: currentMonth,
        },
      });

      return { transaction, passbook: updatedPassbook };
    });
  }
}
