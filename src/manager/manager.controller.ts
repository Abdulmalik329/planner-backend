import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ManagerService } from './manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MANAGER')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  // GET /manager/dashboard
  @Get('dashboard')
  getDashboard() {
    return this.managerService.getDashboardStats();
  }

  // GET /manager/users
  @Get('users')
  getAllUsers(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.managerService.getAllUsers({
      search,
      isActive,
      role,
      sortBy,
      sortOrder,
      page,
      limit,
    });
  }

  // GET /manager/users/:id
  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.managerService.getUserById(id);
  }

  // POST /manager/users
  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.managerService.createUser(dto);
  }

  // PUT /manager/users/:id
  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.managerService.updateUser(id, dto);
  }

  // DELETE /manager/users/:id
  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.managerService.deleteUser(id);
  }

  // PATCH /manager/users/:id/toggle-status
  @Patch('users/:id/toggle-status')
  toggleUserStatus(@Param('id') id: string) {
    return this.managerService.toggleUserStatus(id);
  }
}
