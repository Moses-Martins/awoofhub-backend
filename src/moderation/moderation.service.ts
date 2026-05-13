import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { UserStatus, ModerationActionType, OfferStatus, ReportStatus, TargetType } from 'src/common/types/enums';
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
    @Inject(forwardRef(() => ReportsService))
    private readonly reportService: ReportsService,
  ) { }

  @Transactional()
  async create(dto: CreateModerationDto, userId: string) {

    const admin = await this.userService.getUserById(userId);
    if (!admin) throw new NotFoundException('Admin not found');

    const isRestrictive = [ModerationActionType.SUSPEND, ModerationActionType.BLOCK].includes(dto.actionType);
    const isRestore = dto.actionType === ModerationActionType.RESTORE;

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

    await this.applyModerationEffect(dto.targetType, dto.targetId, dto.actionType);

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
          ModerationActionType.RESTORE
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

  private async applyModerationEffect(targetType: TargetType, targetId: string, actionType: ModerationActionType) {
    const handlers = {
      [TargetType.USER]: () => this.handleUserModeration(targetId, actionType),
      [TargetType.OFFER]: () => this.handleOfferModeration(targetId, actionType),
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
      return this.userService.updateStatus(targetId, UserStatus.SUSPENDED);
    case ModerationActionType.BLOCK:
      return this.userService.updateStatus(targetId, UserStatus.BLOCKED);
    case ModerationActionType.RESTORE:
      return this.userService.updateStatus(targetId, UserStatus.ACTIVE);
    default:
      throw new BadRequestException(`Action '${action}' is not applicable to Users.`)
  }
}

  private async handleOfferModeration(targetId: string, action: ModerationActionType) {
    switch (action) {
      case ModerationActionType.SUSPEND:
        return this.offerService.updateStatus(targetId, OfferStatus.PENDING);
      case ModerationActionType.BLOCK:
        return this.offerService.updateStatus(targetId, OfferStatus.REJECTED);
      case ModerationActionType.RESTORE:
        return this.offerService.updateStatus(targetId, OfferStatus.APPROVED);
      default:
        throw new BadRequestException(`Action '${action}' is not applicable to Offers.`)
    }
  }

  private async handleCommentModeration(targetId: string, action: ModerationActionType) {
    if (action === ModerationActionType.DELETE) {
      return this.commentService.removeComment("-", targetId, true);
    }

    throw new BadRequestException(`Action ${action} is not supported for Comments`);
  }
}
