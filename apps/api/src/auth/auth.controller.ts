import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from './types';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  AdminSendOtpDto,
  AdminVerifyOtpDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  me(@Request() req: AuthRequest) {
    return this.auth.me(req.user.sub);
  }

  @Post('admin/send-otp')
  adminSendOtp(@Body() dto: AdminSendOtpDto) {
    return this.auth.adminSendOtp(dto);
  }

  @Post('admin/verify-otp')
  adminVerifyOtp(@Body() dto: AdminVerifyOtpDto) {
    return this.auth.adminVerifyOtp(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/me')
  @ApiBearerAuth()
  adminMe(@Request() req: AuthRequest) {
    return this.auth.adminMe(req.user.sub);
  }
}
