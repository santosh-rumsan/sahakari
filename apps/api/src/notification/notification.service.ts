import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { NotificationType } from '@rs/db';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}

  async send(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    sendSms = false,
  ) {
    const notif = await this.prisma.notification.create({
      data: { userId, type, title, message },
    });

    if (sendSms) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.phone) {
        await this.sms.send(user.phone, `[Sahakari] ${title}: ${message}`);
      }
    }

    return notif;
  }

  async list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
