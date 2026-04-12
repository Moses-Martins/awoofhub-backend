import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('update')
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

}
