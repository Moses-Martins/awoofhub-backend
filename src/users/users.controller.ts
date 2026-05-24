import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards
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

import { UpdateUserDto } from 'src/users/dto/update-user.dto';

import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('update')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  update(
    @CurrentUser() user,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      user.id,
      updateUserDto,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getMe(@CurrentUser() user) {
    return this.usersService.getUserById(user.id);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll() {
    return this.usersService.findAll();
  }

}