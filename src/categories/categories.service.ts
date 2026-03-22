import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    if (category.userId !== userId) throw new ForbiddenException('Ruxsat yo\'q');
    return category;
  }

  async create(data: any) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: any, userId: string) {
    await this.findOne(id, userId);
    const { userId: _uid, ...updateData } = data;
    return this.prisma.category.update({ where: { id }, data: updateData });
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.category.delete({ where: { id } });
  }
}
