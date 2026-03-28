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
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getAllTasks(@Request() req) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(":id")
  async getTask(@Param("id") id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Post()
  async createTask(@Body() data: any, @Request() req) {
return this.tasksService.create(req.user.id, data);  }

  @Put(":id")
  async updateTask(@Param("id") id: string, @Body() data: any, @Request() req) {
    return this.tasksService.update(id, data, req.user.id);
  }

  @Delete(":id")
  async deleteTask(@Param("id") id: string, @Request() req) {
    return this.tasksService.delete(id, req.user.id);
  }

  @Patch(":id/complete")
  async toggleComplete(@Param("id") id: string, @Request() req) {
    return this.tasksService.toggleComplete(id, req.user.id);
  }

  @Patch(":id/archive")
  async toggleArchive(@Param("id") id: string, @Request() req) {
    return this.tasksService.toggleArchive(id, req.user.id);
  }
}
