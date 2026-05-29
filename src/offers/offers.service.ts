import { forwardRef, Inject,ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertService } from 'src/alert/alert.service';
import { CategoryService } from 'src/category/category.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { NotificationType, OfferStatus } from 'src/common/types/enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { UsersService } from 'src/users/users.service';
import { MoreThan, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { UserStatus } from 'src/common/types/enums';

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
      const existing = await this.categoryService.findByName(category);
      if (!existing) {
        throw new NotFoundException('Category not found');
      }

      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.status === UserStatus.DELETED) {
  throw new ForbiddenException('User not found');
}
if (user.status === UserStatus.BLOCKED) {
  throw new ForbiddenException('Your account has been blocked, you cannot create offers');
}
if (user.status === UserStatus.SUSPENDED) {
  throw new ForbiddenException('Your account has been suspended, you cannot create offers');
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



  async findAll(search?: string, category?: string, minRating?: number, createdFrom?: string, createdTo?: string, page = 1, limit = 10) {
    const now = new Date();
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
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', {
        categorySlug: category
      });
    }

    if (createdFrom) {
      queryBuilder.andWhere('offer.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom)
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('offer.createdAt <= :createdTo', {
        createdTo: new Date(createdTo)
      });
    }

    if (minRating) {
      queryBuilder.having(
        'COALESCE(AVG(review.rating), 0) >= :minRating',
        { minRating }
      );
    }

    queryBuilder.orderBy('offer.createdAt', 'DESC');

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

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

  async findAllAdmin(search?: string, category?: string, minRating?: number, createdFrom?: string, createdTo?: string, page = 1, limit = 10) {
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
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', {
        categorySlug: category
      });
    }

    if (createdFrom) {
      queryBuilder.andWhere('offer.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom)
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('offer.createdAt <= :createdTo', {
        createdTo: new Date(createdTo)
      });
    }

    if (minRating) {
      queryBuilder.having(
        'COALESCE(AVG(review.rating), 0) >= :minRating',
        { minRating }
      );
    }

    queryBuilder.orderBy('offer.createdAt', 'DESC');

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

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
    const now = new Date();
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
      .andWhere('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
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


  async findAllByUser(userId: string, search?: string, category?: string, minRating?: number, createdFrom?: string, createdTo?: string, page = 1, limit = 10) {
    const now = new Date();

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id');

    queryBuilder.andWhere('business.id = :id', { id: user.id })

    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', {
        categorySlug: category
      });
    }

    if (createdFrom) {
      queryBuilder.andWhere('offer.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom)
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('offer.createdAt <= :createdTo', {
        createdTo: new Date(createdTo)
      });
    }

    if (minRating) {
      queryBuilder.having(
        'COALESCE(AVG(review.rating), 0) >= :minRating',
        { minRating }
      );
    }

    queryBuilder.orderBy('offer.createdAt', 'DESC');

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

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

  async findAllByBusiness(userId: string, search?: string, category?: string, minRating?: number, createdFrom?: string, createdTo?: string, page = 1, limit = 10) {

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
      .addGroupBy('category.id');

    queryBuilder.andWhere('business.id = :id', { id: user.id })

    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', {
        categorySlug: category
      });
    }

    if (createdFrom) {
      queryBuilder.andWhere('offer.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom)
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('offer.createdAt <= :createdTo', {
        createdTo: new Date(createdTo)
      });
    }

    if (minRating) {
      queryBuilder.having(
        'COALESCE(AVG(review.rating), 0) >= :minRating',
        { minRating }
      );
    }

    queryBuilder.orderBy('offer.createdAt', 'DESC');

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

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
        where: {
          status: OfferStatus.PENDING,
        },
      }),
      this.offersRepository.count({
        where: {
          status: OfferStatus.APPROVED,
          endDate: MoreThan(now),
        },
      }),
      this.offersRepository.count({
        where: {
          status: OfferStatus.REJECTED,
        },
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

  async getBusinessDashboard(businessId: string) {
    const now = new Date();

    const totalAdsPromise = this.offersRepository.count({
      where: { business: { id: businessId } },
    });

    const pendingAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        status: OfferStatus.PENDING,
      },
    });

    const activeAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        status: OfferStatus.APPROVED,
        endDate: MoreThan(now),
      },
    });

    const rejectedAdsPromise = this.offersRepository.count({
      where: {
        business: { id: businessId },
        status: OfferStatus.REJECTED,
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
      .select([
        'offer.id',
        'offer.title',
        'offer.description',
        'offer.imageUrl',
        'offer.endDate',
        'offer.value',
        'offer.status',
        'offer.createdAt',
        'category.name',
      ])
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COALESCE(COUNT(review.id), 0)', 'reviewCount')
      .groupBy('offer.id')
      .addGroupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.slug')
      .addGroupBy('business.id')
      .addGroupBy('business.name')
      .orderBy('"avgRating"', 'DESC')
      .limit(3)
      .getRawMany();


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

    const topOffers = topOffersData.map((item) => ({
      id: item.offer_id,
      title: item.offer_title,
      description: item.offer_description,
      imageUrl: item.offer_imageUrl,
      value: item.offer_value,
      status: item.offer_status,
      createdAt: item.offer_createdAt,
      endDate: item.offer_endDate,
      category: {
        name: item.category_name,
      },
      avgRating: Number(item.avgRating),
      reviewCount: Number(item.reviewCount),
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

  async updateStatus(offerId: string, status: OfferStatus) {
    try {
      const offer = await this.offersRepository.findOne({
        where: { id: offerId },
      });

      if (!offer) {
        throw new NotFoundException('Offer not found');
      }

      offer.status = status;

      return await this.offersRepository.save(offer);

    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Failed to update offer status');
    }
  }


  async update(offerId: string, userId: string, updateOfferDto: UpdateOfferDto) {
    const offer = await this.offersRepository.findOne({
      where: { id: offerId },
      relations: ['business'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.business.id !== userId) {
      throw new NotFoundException('You can only update your own offers');
    }

    if (updateOfferDto.category) {
      const category = await this.categoryService.findByName(updateOfferDto.category.trim());
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      offer.category = category;
      delete updateOfferDto.category;
    }

    if (updateOfferDto.endDate) {
      offer.endDate = new Date(updateOfferDto.endDate);
      delete updateOfferDto.endDate;
    }

    Object.assign(offer, updateOfferDto);
    return this.offersRepository.save(offer);
  }

  async remove(offerId: string, userId: string) {
    const offer = await this.offersRepository.findOne({
      where: { id: offerId },
      relations: ['business', 'comments', 'reviews', 'wishlists'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.business.id !== userId) {
      throw new NotFoundException('You can only delete your own offers');
    }

    return this.offersRepository.remove(offer);
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
