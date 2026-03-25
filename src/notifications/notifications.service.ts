import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { NotificationType } from 'src/common/types/enums';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private userService: UsersService,
    private readonly paginationService: PaginationService,
  ) { }

  async create(userId: string, title: string, message: string, type: NotificationType, entityId: string) {

    const notification = this.notificationRepo.create({ user: { id: userId }, title, message, type, entityId });

    await this.notificationRepo.save(notification);

    return notification
  }


  async getCountForUser(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const unread = await this.notificationRepo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.isRead = :isRead', { isRead: false })
      .getCount();

    return {
      unread,
    };
  }


  async getAllForUser(userId: string, page = 1, limit = 10) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [notifications, total] = await this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoin('notification.user', 'user')
      .where('user.id = :userId', { userId })
      .select([
        'notification',
        'user.id',
        'user.name',
        'user.email',
      ])
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data: notifications,
      meta,
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.notificationRepo.save(notification);

    return {
      message: 'Notification marked as read',
    };
  }
}


