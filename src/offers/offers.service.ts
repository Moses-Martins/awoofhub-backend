import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertService } from 'src/alert/alert.service';
import { CategoryService } from 'src/category/category.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { ApprovalStatus, NotificationType } from 'src/common/types/enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { UsersService } from 'src/users/users.service';
import { MoreThan, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly paginationService: PaginationService,
    private readonly notificationService: NotificationsService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewService: ReviewsService,
    private readonly alertService: AlertService,
    private readonly categoryService: CategoryService,
  ) { }

  async create(createOfferDto: CreateOfferDto, id: string) {
    try {

      const { category, endDate, ...rest } = createOfferDto;
      const existing = await this.categoryService.findByName(category.trim());
      if (!existing) {
        throw new NotFoundException('Category not found');
      }

      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const offer = this.offersRepository.create({ ...rest, category: { id: existing.id }, endDate: new Date(endDate), business: { id: user.id } });
      await this.offersRepository.save(offer);

      const subscribers = await this.alertService.getSubscribersForBusiness(user.id);

      const notificationPromises = subscribers.map(sub =>
        this.notificationService.create(
          sub.id,
          'New Offer',
          `${user.name} posted a new offer`,
          NotificationType.OFFER_CREATED,
          offer.id,
        )
      );

      // Fire them all at once!
      await Promise.all(notificationPromises);

      await this.notificationService.create(offer.business.id, "Created Offer", "You just created an offer", NotificationType.OFFER_CREATED, offer.id)

      return {
        message: 'Offer created successfully',
        data: offer,
      };
    } catch (error) {

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create offer');
    }
  }

  async findAll(page = 1, limit = 10) {
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit)

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async findById(id: string) {
    const offer = await this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .addSelect([
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const reviews = await this.reviewService.getReviews(id)

    return {
      ...offer,
      ...reviews
    }
  }

  async findByCategoryId(id: string, page = 1, limit = 10) {

    const category = await this.categoryService.findById(id)

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .addSelect([
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('category.id = :id', { id: category.id })
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit)

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }


  async findByUserId(userId: string, page = 1, limit = 10) {

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .addSelect([
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('business.id = :id', { id: user.id })
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .orderBy('offer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }


  async findByCategorySlug(slug: string, page = 1, limit = 10) {

    const category = await this.categoryService.findBySlug(slug)

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .addSelect([
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('category.slug = :slug', { slug: category.slug })
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit)

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async searchOffers(query: string, page = 1, limit = 10) {
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id', 'business.name', 'business.email',
        'category.id', 'category.name',
      ])
      .where('offer.title ILIKE :query', { query: `%${query}%` })
      .orWhere('offer.description ILIKE :query', { query: `%${query}%` })
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit)

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async filter(category?: string, minRating?: number, page = 1, limit = 10) {

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id',
        'business.name',
        'business.email',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')


    if (category) {
      const existing = await this.categoryService.findBySlug(category);
      if (existing) {
        queryBuilder.andWhere('offer.categoryId = :categoryId', { categoryId: existing.id });
      }
    }

    if (minRating) {
      queryBuilder.having('COALESCE(AVG(review.rating), 0) >= :minRating', { minRating });
    }

    const countQuery = queryBuilder.clone()
      .skip(undefined)
      .take(undefined)
      .orderBy()
      .select('offer.id');

    const totalResult = await this.offersRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from(`(${countQuery.getQuery()})`, 'sub')
      .setParameters(countQuery.getParameters())
      .getRawOne();

    const total = Number(totalResult.count);

    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async getRandomOffers(page = 1, limit = 10) {

    const randomIds = await this.offersRepository
      .createQueryBuilder('offer')
      .select('offer.id')
      .orderBy('RANDOM()')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany();

    const ids = randomIds.map(r => r.offer_id);

    if (!ids.length) {
      return {
        data: [],
        meta: this.paginationService.getPaginationMeta(page, limit, 0),
      };
    }

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id', 'business.name', 'business.email',
        'category.id', 'category.name',
      ])
      .whereInIds(ids)
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')

    const total = await this.offersRepository.count();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
      reviewCount: Number(raw[index].reviewCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async getBusinessDashboard(businessId: string) {
    const now = new Date();

    const totalAdsPromise = this.offersRepository.count({
      where: { business: { id: businessId } },
    });

    const pendingAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        approvalStatus: ApprovalStatus.PENDING,
      },
    });

    const activeAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        approvalStatus: ApprovalStatus.APPROVED,
        endDate: MoreThan(now),
      },
    });

    const rejectedAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        approvalStatus: ApprovalStatus.REJECTED,
      },
    });

    const expiredAdsPromise = this.offersRepository
      .createQueryBuilder('offer')
      .where('offer.businessId = :businessId', { businessId })
      .andWhere('offer.endDate < :now', { now })
      .getCount();


    const topOffersPromise = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.business', 'business')
      .where('offer.businessId = :businessId', { businessId })
      .addSelect([
        'category.id',
        'category.name',
        'category.slug',
        'business.id',
        'business.name'
      ])
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id),0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .addGroupBy('business.id')
      .addGroupBy('business.name')
      .orderBy('"avgRating"', 'DESC')
      .limit(3)
      .getRawAndEntities();


    const categoryPiePromise = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.category', 'category')
      .where('offer.businessId = :businessId', { businessId })
      .select('category.name', 'name')
      .addSelect('COUNT(offer.id)', 'value')
      .groupBy('category.name')
      .getRawMany();


    const offersByMonthPromise = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.category', 'category')
      .where('offer.businessId = :businessId', { businessId })
      .select("TO_CHAR(offer.createdAt, 'YYYY-MM')", 'month')
      .addSelect('category.name', 'category')
      .addSelect('COUNT(offer.id)', 'count')
      .groupBy('month')
      .addGroupBy('category.name')
      .orderBy('month', 'ASC')
      .getRawMany();

    const expiringOffersPromise = this.offersRepository
      .createQueryBuilder('offer')
      .where('offer.businessId = :businessId', { businessId })
      .select(`
      SUM(CASE WHEN offer.endDate BETWEEN NOW() AND NOW() + INTERVAL '3 days' THEN 1 ELSE 0 END) as "1-3 days",
      SUM(CASE WHEN offer.endDate BETWEEN NOW() + INTERVAL '4 days' AND NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END) as "4-7 days",
      SUM(CASE WHEN offer.endDate > NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END) as "7+ days"
    `)
      .getRawOne();


    const [
      totalAds,
      activeAds,
      pendingAds,
      rejectedAds,
      expiredAds,
      topOffersData,
      categoryPie,
      offersByMonthRaw,
      expiringOffers,
    ] = await Promise.all([
      totalAdsPromise,
      activeAdsPromise,
      pendingAdsPromise,
      rejectedAdsPromise,
      expiredAdsPromise,
      topOffersPromise,
      categoryPiePromise,
      offersByMonthPromise,
      expiringOffersPromise,
    ]);

    const topOffers = topOffersData.entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(topOffersData.raw[index].avgRating),
      reviewCount: Number(topOffersData.raw[index].reviewCount)
    }));

    const offersByMonth = this.formatMonthlyData(offersByMonthRaw);

    return {
      stats: {
        totalAds,
        activeAds,
        pendingAds,
        rejectedAds,
        expiredAds,
      },
      topOffers,
      charts: {
        categoryPie: categoryPie.map(item => ({
          name: item.name,
          value: Number(item.value),
        })),
        offersByMonth,
        expiringOffers: {
          "1-3 days": Number(expiringOffers['1-3 days']),
          "4-7 days": Number(expiringOffers['4-7 days']),
          "7+ days": Number(expiringOffers['7+ days']),
        },
      },
    };
  }


  private formatMonthlyData(data: any[]) {
    const result = {};

    data.forEach(item => {
      if (!result[item.month]) {
        result[item.month] = { month: item.month };
      }

      result[item.month][item.category] = Number(item.count);
    });

    return Object.values(result);
  }


}
