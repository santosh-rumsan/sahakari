import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TodoModule } from './todo/todo.module';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { GeoModule } from './geo/geo.module';
import { UploadModule } from './upload/upload.module';
import { SmsModule } from './sms/sms.module';
import { NotificationModule } from './notification/notification.module';
import { KycModule } from './kyc/kyc.module';
import { LoanModule } from './loan/loan.module';
import { PassbookModule } from './passbook/passbook.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminKycController } from './kyc/admin-kyc.controller';
import { AdminLoanController } from './loan/admin-loan.controller';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    PrismaModule,
    TodoModule,
    ContactModule,
    AuthModule,
    GeoModule,
    UploadModule,
    SmsModule,
    NotificationModule,
    KycModule,
    LoanModule,
    PassbookModule,
  ],
  controllers: [
    AppController,
    AdminKycController,
    AdminLoanController,
    CustomerController,
  ],
  providers: [AppService],
})
export class AppModule {}
