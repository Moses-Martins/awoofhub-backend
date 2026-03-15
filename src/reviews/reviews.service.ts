import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private usersService: UsersService,
    @Inject(forwardRef(() => OffersService))
    private offersService: OffersService,
  ) { }
  async upsertReview(userId: string, offerId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        offer: { id: offer.id },
        user: { id: user.id }   // filter by the current user too
      },
    });

    if (existingReview) {
      const updatedReview = this.reviewsRepository.merge(
        existingReview,
        createReviewDto
      );

      return this.reviewsRepository.save(updatedReview);
    }

    const review = this.reviewsRepository.create({ ...createReviewDto, user: { id: user.id }, offer: { id: offer.id } });
    return this.reviewsRepository.save(review);
  }


  async getUserReview(userId: string, offerId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const review = await this.reviewsRepository.findOne({
      where: {
        offer: { id: offer.id },
        user: { id: user.id }
      },
    });

    return review
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

}
