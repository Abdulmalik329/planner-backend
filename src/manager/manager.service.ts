import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard Statistics ────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalTasks,
      completedTasks,
      totalCategories,
      usersPerMonth,
      taskCompletionRate,
      recentUsers,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count({ where: { role: Role.USER } }),

      // Active users
      this.prisma.user.count({ where: { role: Role.USER, isActive: true } }),

      // New users this month
      this.prisma.user.count({
        where: {
          role: Role.USER,
          createdAt: { gte: startOfMonth },
        },
      }),

      // New users last month
      this.prisma.user.count({
        where: {
          role: Role.USER,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Total tasks
      this.prisma.task.count(),

      // Completed tasks
      this.prisma.task.count({ where: { completed: true } }),

      // Total categories
      this.prisma.category.count(),

      // Users created per month (last 6 months)
      this.getUsersPerMonth(),

      // Task completion rate per user
      this.getTaskStats(),

      // Recent 5 users
      this.prisma.user.findMany({
        where: { role: Role.USER },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          _count: { select: { tasks: true } },
        },
      }),
    ]);

    const userGrowthPercent =
      newUsersLastMonth > 0
        ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
        : newUsersThisMonth > 0
        ? 100
        : 0;

    return {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth,
        userGrowthPercent,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        totalCategories,
        taskCompletionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      usersPerMonth,
      taskCompletionRate,
      recentUsers,
    };
  }

  private async getUsersPerMonth() {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await this.prisma.user.count({
        where: {
          role: Role.USER,
          createdAt: { gte: start, lte: end },
        },
      });

      months.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return months;
  }

  private async getTaskStats() {
    const total = await this.prisma.task.count();
    const completed = await this.prisma.task.count({ where: { completed: true } });
    const archived = await this.prisma.task.count({ where: { archived: true } });
    const pending = await this.prisma.task.count({
      where: { completed: false, archived: false },
    });

    return { total, completed, archived, pending };
  }

  // ─── User Management ─────────────────────────────────────────────────────

  async getAllUsers(query: {
    search?: string;
    isActive?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    limit?: string;
  }) {
    const {
      search,
      isActive,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (role && role !== '') {
      where.role = role as Role;
    }

    const orderBy: any = {};
    const validSortFields = ['createdAt', 'name', 'email', 'updatedAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              tasks: true,
              categories: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            categories: true,
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            completed: true,
            archived: true,
            priority: true,
            createdAt: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('This email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role ?? Role.USER,
        isActive: dto.isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    await this.getUserById(id);

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing) throw new ConflictException('Email already in use');
      updateData.email = dto.email;
    }
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.password !== undefined) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(id: string) {
    await this.getUserById(id);

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async toggleUserStatus(id: string) {
    const user = await this.getUserById(id);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return updated;
  }
}
