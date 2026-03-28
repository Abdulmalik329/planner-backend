import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { StatisticsModule } from './statistics/statistics.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './common/health.controller';
import { ManagerModule } from './manager/manager.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TasksModule,
    CategoriesModule,
    StatisticsModule,
    ManagerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
