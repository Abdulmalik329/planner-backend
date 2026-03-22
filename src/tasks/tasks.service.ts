import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.userId !== userId) throw new ForbiddenException('Ruxsat yo\'q');
    return task;
  }

  async create(data: any) {
    return this.prisma.task.create({ data });
  }

  async update(id: string, data: any, userId: string) {
    await this.findOne(id, userId);
    // userId ni o'zgartirmaslik uchun olib tashlaymiz
    const { userId: _uid, ...updateData } = data;
    return this.prisma.task.update({ where: { id }, data: updateData });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }

  async toggleComplete(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }

  async toggleArchive(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    return this.prisma.task.update({
      where: { id },
      data: { archived: !task.archived },
    });
  }
}
