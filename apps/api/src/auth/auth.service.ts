import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  RegisterDto,
  LoginDto,
  AdminSendOtpDto,
  AdminVerifyOtpDto,
} from './dto/auth.dto';

export interface MailApiPayload {
  to?: string;
  subject: string;
  email: string;
  message?: string;
  html: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.phone }, { passbookNumber: dto.passbookNumber }],
      },
    });
    if (exists) {
      throw new ConflictException(
        'Phone or passbook number already registered',
      );
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        fullName: dto.fullName,
        cooperative: dto.cooperative,
        passbookNumber: dto.passbookNumber,
        password: hashed,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
    const { password: _, ...userData } = user;
    return { accessToken: token, user: userData };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
    const { password: _, ...userData } = user;
    return { accessToken: token, user: userData };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password: _, ...userData } = user;
    return userData;
  }

  async adminSendOtp(dto: AdminSendOtpDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email },
    });
    if (!admin) throw new BadRequestException('Admin not found');

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.adminOtp.create({
      data: { adminId: admin.id, otp, expiresAt },
    });

    await this.sendOtpEmail(admin.email, admin.name, otp);
    return { message: 'OTP sent to email' };
  }

  async adminVerifyOtp(dto: AdminVerifyOtpDto) {
    const otpRecord = await this.prisma.adminOtp.findFirst({
      where: {
        admin: { email: dto.email },
        otp: dto.otp,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { admin: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

    await this.prisma.adminOtp.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    const token = this.jwtService.sign({
      sub: otpRecord.admin.id,
      email: otpRecord.admin.email,
      role: otpRecord.admin.role,
    });
    const { ...adminData } = otpRecord.admin;
    return { accessToken: token, admin: adminData };
  }

  async adminMe(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new UnauthorizedException();
    return admin;
  }

  private async sendOtpEmail(email: string, name: string, otp: string) {
    const serviceUrl = process.env.EMAIL_SERVICE_URL;
    const apiKey = process.env.EMAIL_SERVICE_API_KEY;
    if (!serviceUrl) return;

    try {
      await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          to: email,
          email,
          subject: `Your OTP for Sahakari Admin: ${otp}`,
          html: `<p>Hi ${name},</p><p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
        } satisfies MailApiPayload),
      });
    } catch (err) {
      console.error('Failed to send OTP email:', err);
    }
  }
}
