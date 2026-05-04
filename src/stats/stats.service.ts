import { Injectable } from '@nestjs/common';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StatsService {
  constructor(
    private usersService: UsersService,
    private offersService: OffersService,
  ) { }

  async getDashboardStats() {
    const [users, offers] = await Promise.all([
      this.usersService.getUserStats(),
      this.offersService.getOfferStats(),
    ]);

    return {
      users,
      offers,
    };
  }

}
