import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { User } from 'src/users/entities/user.entity';
import { CreateModerationDto } from './dto/create-moderation.dto';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateModerationDto, @CurrentUser() user: User) {
    return this.moderationService.create(dto, user.id);
  }

  @Get('history/:targetId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTargetHistory(@Param('targetId') targetId: string) {
    return await this.moderationService.getHistoryForTarget(targetId);
  }

  @Get('history/:targetId/latest')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getLatestHistoryForTarget(@Param('targetId') targetId: string) {
    return this.moderationService.getLatestHistoryForTarget(targetId);
  }
}
