import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @UseGuards(AuthGuard)
  getAllForUser(@CurrentUser() user, @Query('page') page: number, @Query('limit') limit: number) {
    return this.notificationsService.getAllForUser(user.id, page, limit);
  }

  @Get('unread')
  @UseGuards(AuthGuard)
  getCountForUser(@CurrentUser() user) {
    return this.notificationsService.getCountForUser(user.id);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard)
  markRead(@CurrentUser() user, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, user.id);
  }

}
