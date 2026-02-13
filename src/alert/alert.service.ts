import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepo: Repository<Alert>,
    private userService: UsersService,
  ) { }

  async subscribe(userId: string, businessId: string) {
    if (userId === businessId) {
      throw new BadRequestException('You cannot subscribe to your own business alerts');
    }

    const [user, business] = await Promise.all([
      this.userService.getUserById(userId),
      this.userService.getUserById(businessId)
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!business) throw new NotFoundException('Business not found');


    if (business.role !== 'business') {
      throw new BadRequestException('Alerts can only be set for business accounts');
    }

    const existing = await this.alertRepo.findOne({
      where: { user: { id: userId }, business: { id: businessId } }
    });

    if (existing) throw new ConflictException('Already subscribed to this business');

    const subscription = this.alertRepo.create({
      user: { id: userId },
      business: { id: businessId }
    });

    return await this.alertRepo.save(subscription);
  }

  async getSubscribersForBusiness(businessId: string) {
    const subs = await this.alertRepo.find({
      where: { business: { id: businessId } },
      relations: ['user'],
    });

    return subs.map(s => s.user);
  }
}
