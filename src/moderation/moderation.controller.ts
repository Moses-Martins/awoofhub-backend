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

import { CreateModerationDto } from './dto/create-moderation.dto';
import { ModerationService } from './moderation.service';

@ApiTags('Moderation')
@ApiBearerAuth()
@Controller('moderation')
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create moderation action',
  })
  @ApiResponse({
    status: 201,
    description: 'Moderation action created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  create(
    @Body() dto: CreateModerationDto,
    @CurrentUser() user: User,
  ) {
    return this.moderationService.create(dto, user.id);
  }

  @Get('history/:targetId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get moderation history for a target',
  })
  @ApiParam({
    name: 'targetId',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Target entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Moderation history fetched successfully',
  })
  async getTargetHistory(
    @Param('targetId') targetId: string,
  ) {
    return await this.moderationService.getHistoryForTarget(
      targetId,
    );
  }

  @Get('history/:targetId/latest')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get latest moderation history for a target',
  })
  @ApiParam({
    name: 'targetId',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Target entity ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Latest moderation history fetched successfully',
  })
  getLatestHistoryForTarget(
    @Param('targetId') targetId: string,
  ) {
    return this.moderationService.getLatestHistoryForTarget(
      targetId,
    );
  }
}