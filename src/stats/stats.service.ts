import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Click } from 'src/clicks/entities/click.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { OfferStatus, ReportStatus, UserRole, UserStatus } from 'src/common/types/enums';
import { Offer } from 'src/offers/entities/offer.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Click)
    private clicksRepository: Repository<Click>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,

  ) { }

  async getDashboardStats() {
    const [users, offers, reports, comments] = await Promise.all([
      this.getUserStats(),
      this.getOfferStats(),
      this.getReportStats(),
      this.getCommentStats(),
    ]);

    return {
      users,
      offers,
      reports,
      comments,
    };
  }

  async getUserStats() {
    const [totalActive, businessActive, suspended, banned] = await Promise.all([
      this.userRepository.count({
        where: { status: UserStatus.ACTIVE }
      }),
      this.userRepository.count({
        where: { role: UserRole.BUSINESS, status: UserStatus.ACTIVE }
      }),
      this.userRepository.count({
        where: { status: UserStatus.SUSPENDED }
      }),
      this.userRepository.count({
        where: { status: UserStatus.BANNED }
      }),
    ]);

    return {
      totalActive,
      businessActive,
      suspended,
      banned
    };
  }

  async getOfferStats() {
    const now = new Date();

    const [
      totalOffers,
      pendingOffers,
      activeOffers,
      rejectedOffers,
      expiredOffers,
    ] = await Promise.all([
      this.offersRepository.count(),
      this.offersRepository.count({
        where: { status: OfferStatus.PENDING },
      }),
      this.offersRepository.count({
        where: {
          status: OfferStatus.APPROVED,
          endDate: MoreThan(now),
        },
      }),
      this.offersRepository.count({
        where: { status: OfferStatus.REJECTED },
      }),
      this.offersRepository
        .createQueryBuilder('offer')
        .where('offer.endDate < :now', { now })
        .getCount(),
    ]);

    return {
      totalOffers,
      pendingOffers,
      activeOffers,
      rejectedOffers,
      expiredOffers,
    };
  }

  async getReportStats() {
    const [totalReports, pendingReports, activeReports, expiredReports] = await Promise.all([
      this.reportRepo.count(),
      this.reportRepo.count({
        where: { status: ReportStatus.PENDING },
      }),
      this.reportRepo.count({
        where: { status: ReportStatus.RESOLVED },
      }),
      this.reportRepo.count({
        where: { status: ReportStatus.DISMISSED },
      }),
    ]);

    return {
      totalReports,
      pendingReports,
      activeReports,
      expiredReports,
    };
  }

  async getCommentStats() {
    const totalComments = await this.commentsRepository.count();

    return {
      totalComments,
    };
  }

  async getOfferClickCount(offerId: string): Promise<number> {
    return await this.clicksRepository.count({
      where: {
        offer: { id: offerId }
      }
    });
  }

  async getReviews(offerId: string) {

    const overall = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.offerId = :offerId', { offerId })
      .getRawOne();

    const distributionRaw = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.offerId = :offerId', { offerId })
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    distributionRaw.forEach(d => {
      ratingDistribution[d.rating] = Number(d.count);
    });

    return {
      avgRating: Number(overall.avgRating),
      reviewCount: Number(overall.reviewCount),
      ratingDistribution
    };
  }

  async getUserOfferCount(userId: string): Promise<number> {
    return this.offersRepository.count({
      where: {
        contributor: {
          id: userId,
        },
      },
    });
  }

  async getUserOfferClicksCount(userId: string): Promise<number> {
    return this.clicksRepository
      .createQueryBuilder('click')
      .leftJoin('click.offer', 'offer')
      .where('offer.userId = :userId', { userId })
      .getCount();
  }

}
