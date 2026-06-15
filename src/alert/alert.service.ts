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

  async setAlert(userId: string, contributorId: string) {
    if (userId === contributorId) {
      throw new BadRequestException('You cannot set Alert to yourself');
    }

    const [user, contributor] = await Promise.all([
      this.userService.getUserById(userId),
      this.userService.getUserById(contributorId)
    ]);

    if (!user) throw new NotFoundException('User not found');
    if (!contributor) throw new NotFoundException('Contributor not found');

    const existing = await this.alertRepo.findOne({
      where: { user: { id: userId }, contributor: { id: contributorId } }
    });

    if (existing) throw new ConflictException('Already subscribed to this contributor');

    const subscription = this.alertRepo.create({
      user: { id: userId },
      contributor: { id: contributorId }
    });

    return await this.alertRepo.save(subscription);
  }

  async removeAlert(userId: string, contributorId: string) {

     const result = await this.alertRepo.delete({
          contributor: { id: contributorId },
          user: { id: userId }
        });
    
        if (result.affected === 0) {
          throw new NotFoundException("Alert not set for contributor");
        }
    
        return {}

  }

  async getContributorAlert(userId: string, contributorId: string) {
    const result = await this.alertRepo.findOne({
      where: { user: { id: userId }, contributor: { id: contributorId } }
    });

    return result

  }

  async getSubscribers(contributorId: string) {
    const subs = await this.alertRepo.find({
      where: { contributor: { id: contributorId } },
      relations: ['user'],
    });

    return subs.map(s => s.user);
  }
}
