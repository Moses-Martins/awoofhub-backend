import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/pagination.service';
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
    private offersService: OffersService,
    private readonly paginationService: PaginationService,
  ) { }
  async addReview(userId: string, OfferId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(OfferId);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const alreadyReviewed = await this.reviewsRepository.findOne({
      where: {
        offer: { id: offer.id },
        user: { id: user.id }   // filter by the current user too
      },
    });

    if (alreadyReviewed) {
      throw new BadRequestException('Offer already reviewed!');
    }

    const review = this.reviewsRepository.create({ ...createReviewDto, user: { id: user.id }, offer: { id: offer.id } });
    return this.reviewsRepository.save(review);
  }

  async getofferReviews(offerId: string, page = 1, limit = 10) {

    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .select([
        'review',
        'user.id', 'user.name', 'user.profile_image_url',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .where('review.offer = :offerId', { offerId })
      .getMany();


    const total = await this.reviewsRepository.count();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);



    return {
      data: reviews,
      meta
    };
  }

}
