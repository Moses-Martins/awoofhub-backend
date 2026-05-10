import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Patch('update')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user, @Body() UpdateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, UpdateUserDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user) {
    return this.usersService.getUserById(user.id);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Post(":id/admin/moderate")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateUserStatusDto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, updateUserStatusDto.status);
  }

}
