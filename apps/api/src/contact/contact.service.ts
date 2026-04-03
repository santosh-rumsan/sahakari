import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateContactDto } from './dto/create-contact.dto.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.contact.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateContactDto) {
    return this.prisma.contact.create({ data: dto });
  }

  update(id: string, dto: UpdateContactDto) {
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.contact.delete({ where: { id } });
  }
}
