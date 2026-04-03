import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateTodoDto) {
    return this.prisma.todo.create({ data: { title: dto.title } });
  }

  update(id: string, dto: UpdateTodoDto) {
    return this.prisma.todo.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
