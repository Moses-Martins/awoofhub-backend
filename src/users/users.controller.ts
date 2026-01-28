import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(AuthGuard)
  viewWishlist(@CurrentUser() user) {
    return this.usersService.getUserById(user.id);
  }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

}
