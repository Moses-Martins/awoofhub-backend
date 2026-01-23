import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get('email/:email')
  @HttpCode(200)
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

}
