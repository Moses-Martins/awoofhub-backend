import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private userService: UsersService,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(userId: string, title: string, message: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const notification = this.notificationRepo.create({ user: { id: user.id }, title, message });

    await this.notificationRepo.save(notification);
    this.eventEmitter.emit('notification.created', notification);

    return notification
  }

  async findForUser(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.notificationRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { read: true });
  }
}


