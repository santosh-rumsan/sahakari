import { Module } from '@nestjs/common';
import {
  PassbookController,
  AdminPassbookController,
} from './passbook.controller';
import { PassbookService } from './passbook.service';

@Module({
  controllers: [PassbookController, AdminPassbookController],
  providers: [PassbookService],
  exports: [PassbookService],
})
export class PassbookModule {}
