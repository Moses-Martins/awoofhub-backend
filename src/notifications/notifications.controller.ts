import { Controller, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

}
