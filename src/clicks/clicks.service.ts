import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/common/types/enums';
import { OffersService } from 'src/offers/offers.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Click } from './entities/click.entity';

@Injectable()
export class ClicksService {
  constructor(
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
    private usersService: UsersService,
    private offersService: OffersService,
  ) { }

  async create(userId: string, OfferId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.checkUserStatus(user);

    const offer = await this.offersService.findById(OfferId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const existing = await this.clicksRepository.findOne({
      where: {
        offer: { id: offer.id },
        user: { id: user.id }
      },
    });

    if (existing) {
      return existing;
    }

    const clickedItem = this.clicksRepository.create({ user: { id: user.id }, offer: { id: offer.id } });
    return this.clicksRepository.save(clickedItem);

  }

  async getClickCount(offerId: string): Promise<number> {
    return await this.clicksRepository.count({
      where: {
        offer: { id: offerId }
      }
    });
  }

  private checkUserStatus(user: User) {
    if (user.status === UserStatus.DELETED) {
      throw new ForbiddenException('User not found');
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException(
        'Your account has been banned, you cannot post comments',
      );
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        'Your account has been suspended, you cannot post comments',
      );
    }
  }
}

