import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!task) throw new NotFoundException("Vazifa topilmadi");
    if (task.userId !== userId) throw new ForbiddenException("Ruxsat yo'q");
    return task;
  }

  // Create metodida userId ni connect orqali bog'lash kerak
  async create(userId: string, data: any) {
    const { categoryId, ...rest } = data;
    return this.prisma.task.create({
      data: {
        ...rest,
        user: { connect: { id: userId } },
        // Agar kategoriya yuborilgan bo'lsa, uni ham bog'laymiz
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      },
    });
  }

  // Update metodidagi xatoni tuzatish
  async update(id: string, data: any, userId: string) {
    await this.findOne(id, userId);

    // data: any ishlatish orqali userId xatosidan qutulamiz
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: _uid, categoryId, ...updateData } = data;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        // Kategoriya o'zgargan bo'lsa, uni yangilaymiz
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      },
    });
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
