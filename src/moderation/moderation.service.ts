import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { ModerationActionType, NotificationEntityType, NotificationType, OfferStatus, ReportStatus, TargetType, UserStatus } from 'src/common/types/enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { OffersService } from 'src/offers/offers.service';
import { ReportsService } from 'src/reports/reports.service';
import { UsersService } from 'src/users/users.service';
import { In, LessThan, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateModerationDto } from './dto/create-moderation.dto';
import { Moderation } from './entities/moderation.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Moderation)
    private moderationRepo: Repository<Moderation>,
    private readonly userService: UsersService,
    private readonly offerService: OffersService,
    private readonly commentService: CommentsService,
    private readonly reportService: ReportsService,
    private readonly notificationService: NotificationsService,
  ) { }

  @Transactional()
  async create(dto: CreateModerationDto, userId: string) {

    const admin = await this.userService.getUserById(userId);
    if (!admin) throw new NotFoundException('Admin not found');

    const isRestrictive = [ModerationActionType.SUSPEND, ModerationActionType.BLOCK].includes(dto.actionType);
    const isRestore = dto.actionType === ModerationActionType.ACTIVATE;

    if (isRestrictive || isRestore) {
      await this.moderationRepo.update(
        { targetId: dto.targetId, isActive: true },
        { isActive: false }
      );
    }

    const action = this.moderationRepo.create({
      ...dto,
      admin,
      isActive: isRestrictive
    });

    await this.moderationRepo.save(action);

    await this.applyModerationEffect(dto.targetType, dto.targetId, dto.actionType, dto.reason);

    if (dto.reportId) {
      await this.reportService.updateStatus(dto.reportId, ReportStatus.RESOLVED);
    }

    return action;
  }


  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredModerations() {
    const now = new Date();

    const expiredPenalties = await this.moderationRepo.find({
      where: {
        endsAt: LessThan(now),
        isActive: true,
      },
    });

    if (expiredPenalties.length === 0) return;

    const RESTRICTIVE_ACTIONS = [
      ModerationActionType.SUSPEND,
      ModerationActionType.BLOCK
    ];

    for (const penalty of expiredPenalties) {
      penalty.isActive = false;
      await this.moderationRepo.save(penalty);

      const remainingRestrictiveCount = await this.moderationRepo.count({
        where: {
          targetId: penalty.targetId,
          targetType: penalty.targetType,
          isActive: true,
          actionType: In(RESTRICTIVE_ACTIONS)
        }
      });

      if (remainingRestrictiveCount === 0) {
        await this.applyModerationEffect(
          penalty.targetType,
          penalty.targetId,
          ModerationActionType.ACTIVATE
        );
      }
    }
  }

  async getHistoryForTarget(targetId: string) {
    return this.moderationRepo.find({
      where: { targetId },
      order: { createdAt: 'DESC' },
      relations: ['admin']
    });
  }

  async getLatestHistoryForTarget(targetId: string) {
    return this.moderationRepo.findOne({
      where: { targetId },
      order: { createdAt: 'DESC' },
      relations: ['admin']
    });
  }

  private async applyModerationEffect(targetType: TargetType, targetId: string, actionType: ModerationActionType, reason?: string) {
    const handlers = {
      [TargetType.USER]: () => this.handleUserModeration(targetId, actionType),
      [TargetType.OFFER]: () => this.handleOfferModeration(targetId, actionType, reason),
      [TargetType.COMMENT]: () => this.handleCommentModeration(targetId, actionType),
    };

    const handler = handlers[targetType];
    if (!handler) {
      throw new InternalServerErrorException(`No moderation handler for ${targetType}`);
    }

    await handler();
  }

  private async handleUserModeration(targetId: string, action: ModerationActionType) {
    switch (action) {
      case ModerationActionType.SUSPEND:
        const result = await this.userService.updateStatus(targetId, UserStatus.SUSPENDED);

        await this.notificationService.create({
          userId: targetId,
          title: "Your Account Has Been Suspended",
          message: "Your ability to submit new deals has been temporarily suspended due to a potential violation of our community guidelines. You can continue browsing AwoofHub, and your posting privileges will be restored after 30 days unless the suspension is overturned. If you believe this was a mistake, you can request an account review.",
          type: NotificationType.USER_SUSPENDED,
          entityType: NotificationEntityType.USER,
          entityId: targetId,
        });

        return result;

      case ModerationActionType.BLOCK:
        return this.userService.updateStatus(targetId, UserStatus.BANNED);
      case ModerationActionType.ACTIVATE:
        return this.userService.updateStatus(targetId, UserStatus.ACTIVE);
      default:
        throw new BadRequestException(`Action '${action}' is not applicable to Users.`)
    }
  }

  private async handleOfferModeration(targetId: string, action: ModerationActionType, reason?: string) {
    const offer = await this.offerService.findById(targetId);
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${targetId} not found.`);
    }

    let targetStatus: OfferStatus;
    switch (action) {
      case ModerationActionType.SUSPEND:
        targetStatus = OfferStatus.SUSPENDED;
        break;
      case ModerationActionType.BLOCK:
        targetStatus = OfferStatus.REJECTED;
        break;
      case ModerationActionType.ACTIVATE:
        targetStatus = OfferStatus.APPROVED;
        break;
      default:
        throw new BadRequestException(`Action '${action}' is not applicable to Offers.`);
    }

    await this.offerService.updateStatus(targetId, targetStatus);

    let title = "";
    let message = "";
    let type: NotificationType;

    switch (targetStatus) {
      case OfferStatus.SUSPENDED:
        title = "Oops! This deal is on hold";
        message = reason || "This deal is temporarily unavailable because it has been placed on hold.";
        type = NotificationType.OFFER_SUSPENDED;
        break;

      case OfferStatus.REJECTED:
        title = "Rejected";
        message = reason || "Your submission was not approved. Please review the community guidelines and resubmit with clearer pricing and terms before reposting.";
        type = NotificationType.OFFER_REJECTED;
        break;

      case OfferStatus.APPROVED:
        title = "Approved";
        message = "Your post is approved and live! Now visible to thousands of shoppers across the platform.";
        type = NotificationType.OFFER_APPROVED;
        break;
    }

    await this.notificationService.create({
      userId: offer.contributor.id,
      title,
      message,
      type,
      entityType: NotificationEntityType.OFFER,
      entityId: offer.id,
    });

  }

  private async handleCommentModeration(targetId: string, action: ModerationActionType) {
    if (action === ModerationActionType.DELETE) {
      return this.commentService.removeComment("-", targetId, true);
    }

    throw new BadRequestException(`Action ${action} is not supported for Comments`);
  }
}
