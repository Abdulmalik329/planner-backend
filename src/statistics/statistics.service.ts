import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

    const highPriority = tasks.filter(
      (t) => t.priority === 'high' && !t.completed,
    ).length;
    const mediumPriority = tasks.filter(
      (t) => t.priority === 'medium' && !t.completed,
    ).length;
    const lowPriority = tasks.filter(
      (t) => t.priority === 'low' && !t.completed,
    ).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Bugungi vazifalar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= today && taskDate < tomorrow;
    }).length;

    const todayCompleted = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= today && taskDate < tomorrow && t.completed;
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
