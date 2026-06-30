import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get notifications for authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully',
  })
  getAllForUser(
    @CurrentUser() user,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.notificationsService.getAllForUser(
      user.id,
      page,
      limit,
    );
  }

  @Get('unread')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get unread notification count',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notification count fetched successfully',
  })
  getCountForUser(@CurrentUser() user) {
    return this.notificationsService.getCountForUser(
      user.id,
    );
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mark notification as read',
  })
  @ApiParam({
    name: 'id',
    type: String,
    example: '64f8c2d9a12b3c0012345678',
    description: 'Notification ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  markRead(
    @CurrentUser() user,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(
      id,
      user.id,
    );
  }


  @Patch('read-all')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Mark all notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  markAllRead(@CurrentUser() user) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}