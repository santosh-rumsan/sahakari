import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async getProvinces() {
    return this.prisma.province.findMany({ orderBy: { name: 'asc' } });
  }

  async getDistricts(provinceId?: string) {
    return this.prisma.district.findMany({
      where: provinceId ? { provinceId } : undefined,
      orderBy: { name: 'asc' },
      include: { province: true },
    });
  }

  async getMunicipalities(districtId?: string) {
    return this.prisma.municipality.findMany({
      where: districtId ? { districtId } : undefined,
      orderBy: { name: 'asc' },
      include: { district: true },
    });
  }
}
