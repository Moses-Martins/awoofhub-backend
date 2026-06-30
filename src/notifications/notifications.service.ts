import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { CreateNotificationArgs } from 'src/common/types/notification';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { In, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

interface RegistryConfig {
  repo: Repository<any>;
  select: Record<string, boolean>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
    private userService: UsersService,
    private readonly paginationService: PaginationService,
  ) { }

  async create({userId, title, message, type, entityType, entityId}: CreateNotificationArgs) {

    const notification = this.notificationRepo.create({ user: { id: userId }, title, message, type, entityType, entityId });

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


    const data = await this.enrich(notifications);

    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data,
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

  async markAllAsRead(userId: string) {
    const result = await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );

    return {
      message: 'All notifications marked as read',
      updatedCount: result.affected ?? 0,
    };
  }


  async enrich(notifications: Notification[]) {
    const groups: Record<string, string[]> = {};
    for (const n of notifications) {
      if (n.entityType && n.entityId) {
        groups[n.entityType] ??= [];
        groups[n.entityType].push(n.entityId);
      }
    }

    const resourceMaps: Record<string, Map<string, any>> = {};

    await Promise.all(
      Object.entries(groups).map(async ([entityType, ids]) => {
        const target = this.repoRegistry[entityType];
        if (!target) return;

        const entities = await target.repo.find({
          where: { id: In([...new Set(ids)]) },
          select: target.select,
        });

        resourceMaps[entityType] = new Map(entities.map((e) => [e.id, e]));
      }),
    );

    return notifications.map((n) => ({
      ...n,
      payload: resourceMaps[n.entityType]?.get(n.entityId) ?? null,
    }));
  }

  private get repoRegistry(): Record<string, RegistryConfig> {
    return {
      offer: {
        repo: this.offerRepo,
        select: { id: true, title: true, imageUrl: true },
      },

      user: {
        repo: this.userRepo,
        select: { id: true, name: true, email: true, username: true },
      },
    };
  }
}


