import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Get(':id')
  async getCategory(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @Post()
  async createCategory(@Body() data: any, @Request() req) {
    return this.categoriesService.create({ ...data, userId: req.user.userId });
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req,
  ) {
    return this.categoriesService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string, @Request() req) {
    return this.categoriesService.delete(id, req.user.userId);
  }
}
