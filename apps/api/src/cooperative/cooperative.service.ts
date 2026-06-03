import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCooperativeDto } from './dto/cooperative.dto';

@Injectable()
export class CooperativeService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdate(dto: CreateCooperativeDto, adminId: string) {
    // Get admin user
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      include: { cooperative: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Check if cooperative with same name or PAN exists
    if (dto.name) {
      const existingByName = await this.prisma.cooperative.findUnique({
        where: { name: dto.name },
      });
      if (existingByName && existingByName.id !== admin.cooperativeId) {
        throw new BadRequestException(
          'Cooperative with this name already exists',
        );
      }
    }

    if (dto.panNumber) {
      const existingByPan = await this.prisma.cooperative.findUnique({
        where: { panNumber: dto.panNumber },
      });
      if (existingByPan && existingByPan.id !== admin.cooperativeId) {
        throw new BadRequestException(
          'Cooperative with this PAN number already exists',
        );
      }
    }

    if (dto.registrationNumber) {
      const existingByReg = await this.prisma.cooperative.findUnique({
        where: { registrationNumber: dto.registrationNumber },
      });
      if (existingByReg && existingByReg.id !== admin.cooperativeId) {
        throw new BadRequestException(
          'Cooperative with this registration number already exists',
        );
      }
    }

    if (dto.email) {
      const existingByEmail = await this.prisma.cooperative.findUnique({
        where: { email: dto.email },
      });
      if (existingByEmail && existingByEmail.id !== admin.cooperativeId) {
        throw new BadRequestException(
          'Cooperative with this email already exists',
        );
      }
    }

    // If admin already has a cooperative, update it
    if (admin.cooperativeId) {
      const cooperative = await this.prisma.cooperative.update({
        where: { id: admin.cooperativeId },
        data: {
          name: dto.name,
          code: dto.code,
          provinceId: dto.provinceId,
          districtId: dto.districtId,
          municipalityId: dto.municipalityId,
          wardNumber: dto.wardNumber,
          tole: dto.tole,
          address: dto.address,
          establishedYear: dto.establishedYear
            ? new Date(dto.establishedYear)
            : undefined,
          panNumber: dto.panNumber,
          registrationNumber: dto.registrationNumber,
          logoUrl: dto.logoUrl,
          email: dto.email,
          contactNumber: dto.contactNumber,
        },
        include: {
          province: true,
          district: true,
          municipality: true,
        },
      });
      return cooperative;
    }

    // Create new cooperative and link to admin
    const cooperative = await this.prisma.cooperative.create({
      data: {
        name: dto.name,
        code: dto.code,
        provinceId: dto.provinceId,
        districtId: dto.districtId,
        municipalityId: dto.municipalityId,
        wardNumber: dto.wardNumber,
        tole: dto.tole,
        address: dto.address,
        establishedYear: dto.establishedYear
          ? new Date(dto.establishedYear)
          : undefined,
        panNumber: dto.panNumber,
        registrationNumber: dto.registrationNumber,
        logoUrl: dto.logoUrl,
        email: dto.email,
        contactNumber: dto.contactNumber,
        isActive: true,
      },
      include: {
        province: true,
        district: true,
        municipality: true,
      },
    });

    // Link cooperative to admin
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { cooperativeId: cooperative.id },
    });

    return cooperative;
  }

  async getMyCooperative(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      include: {
        cooperative: {
          include: {
            province: true,
            district: true,
            municipality: true,
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin.cooperative;
  }

  async checkCooperativeSetup(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { cooperativeId: true },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return {
      isSetup: !!admin.cooperativeId,
      cooperativeId: admin.cooperativeId,
    };
  }

  async listActiveCooperatives() {
    return this.prisma.cooperative.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
