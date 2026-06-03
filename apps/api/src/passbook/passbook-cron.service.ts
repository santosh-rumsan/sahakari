import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PassbookService } from './passbook.service';

@Injectable()
export class PassbookCronService {
  private readonly logger = new Logger(PassbookCronService.name);

  constructor(private readonly passbookService: PassbookService) {}

  /**
   * 🕐 Runs on 1st of every month at 12:01 AM
   * Cron format: second minute hour day month dayOfWeek
   */
  @Cron('0 1 0 1 * *', {
    name: 'monthly-interest-credit',
    timeZone: 'Asia/Kathmandu',
  })
  async handleMonthlyInterestCredit() {
    this.logger.log('🚀 Starting monthly interest credit cron job...');
    try {
      const result = await this.passbookService.creditMonthlyInterest();
      this.logger.log(
        `✅ Monthly interest credit completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`,
      );

      if (result.failed > 0) {
        this.logger.error('Errors occurred:', result.errors);
      }
    } catch (error) {
      this.logger.error('❌ Monthly interest credit cron failed:', error);
    }
  }

  /**
   * Optional: Run every day at 11:59 PM to credit interest for next day
   * Uncomment if you want daily credits instead of monthly
   */
  // @Cron('0 59 23 * * *', {
  //   name: 'daily-interest-credit',
  //   timeZone: 'Asia/Kathmandu',
  // })
  // async handleDailyInterestCredit() {
  //   this.logger.log('Starting daily interest credit...');
  //   // Same logic as monthly
  // }
}
