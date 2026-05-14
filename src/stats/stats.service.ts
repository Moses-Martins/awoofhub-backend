import { Injectable } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { OffersService } from 'src/offers/offers.service';
import { ReportsService } from 'src/reports/reports.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class StatsService {
  constructor(
    private usersService: UsersService,
    private offersService: OffersService,
    private reportsService: ReportsService,
    private commentsService: CommentsService,
  ) { }

  async getDashboardStats() {
    const [users, offers, reports, comments] = await Promise.all([
      this.usersService.getUserStats(),
      this.offersService.getOfferStats(),
      this.reportsService.getReportStats(),
      this.commentsService.getCommentStats(),
    ]);

    return {
      users,
      offers,
      reports,
      comments,
    };
  }

}
