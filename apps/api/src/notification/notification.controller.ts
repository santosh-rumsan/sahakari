import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/types';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notif: NotificationService) {}

  @Get()
  list(@Request() req: AuthRequest) {
    return this.notif.list(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.notif.markRead(id, req.user.sub);
  }
}
