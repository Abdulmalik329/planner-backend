import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAllTasks(@Request() req) {
    return this.tasksService.findAll(req.user.userId);
  }

  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Post()
  async createTask(@Body() data: any, @Request() req) {
    return this.tasksService.create({ ...data, userId: req.user.userId });
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.tasksService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.delete(id, req.user.userId);
  }

  @Patch(':id/complete')
  async toggleComplete(@Param('id') id: string, @Request() req) {
    return this.tasksService.toggleComplete(id, req.user.userId);
  }

  @Patch(':id/archive')
  async toggleArchive(@Param('id') id: string, @Request() req) {
    return this.tasksService.toggleArchive(id, req.user.userId);
  }
}
