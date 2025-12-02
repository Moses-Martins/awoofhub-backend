import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: User,
  })
  @Get(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: 'Retrieve a user by username' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: User,
  })
  @Get('username/:username')
  @HttpCode(200)
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @ApiOperation({ summary: 'Retrieve a user by email' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: User,
  })
  @Get('email/:email')
  @HttpCode(200)
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }


}
