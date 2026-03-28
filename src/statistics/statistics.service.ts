import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Priority } from "@prisma/client"; // Enumni import qilamiz

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(userId: string) {
    const [tasks, categories] = await Promise.all([
      this.prisma.task.findMany({ where: { userId } }),
      this.prisma.category.findMany({ where: { userId } }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const activeTasks = tasks.filter((t) => !t.completed && !t.archived).length;
    const archivedTasks = tasks.filter((t) => t.archived).length;

    // Prisma enumlariga (Priority.HIGH va hokazo) moslandi
    const highPriority = tasks.filter(
      (t) => t.priority === Priority.HIGH && !t.completed,
    ).length;
    const mediumPriority = tasks.filter(
      (t) => t.priority === Priority.MEDIUM && !t.completed,
    ).length;
    const lowPriority = tasks.filter(
      (t) => t.priority === Priority.LOW && !t.completed,
    ).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Bugungi vazifalar uchun vaqtni hisoblash (dueDate asosida)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // .dueDate ishlatildi (dueDate null bo'lsa, hisobga olinmaydi)
    const todayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate >= todayStart && taskDate < todayEnd;
    }).length;

    const todayCompleted = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return taskDate >= todayStart && taskDate < todayEnd && t.completed;
    }).length;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      archivedTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      completionRate,
      categories: categories.length,
      todayTasks,
      todayCompleted,
    };
  }
}
