import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new category',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid category payload',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories fetched successfully',
  })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('business')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get categories belonging to authenticated business',
  })
  @ApiResponse({
    status: 200,
    description: 'Business categories fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  findAllBusiness(@CurrentUser() user: User) {
    return this.categoryService.findAllByBusiness(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Category fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findById(id);
  }
}