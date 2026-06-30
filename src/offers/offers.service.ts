import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertService } from 'src/alert/alert.service';
import { CategoryService } from 'src/category/category.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { MyOffersTab, NotificationEntityType, NotificationType, OfferStatus, UserStatus } from 'src/common/types/enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { StatsService } from 'src/stats/stats.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';
import { FindOffersQueryDto } from './dto/find-offer-query.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private readonly paginationService: PaginationService,
    private readonly notificationService: NotificationsService,
    private readonly userService: UsersService,
    private readonly statsService: StatsService,
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
      this.checkUserStatus(user)

      const offer = this.offersRepository.create({ ...rest, category: { id: existing.id }, endDate: new Date(endDate), contributor: { id: user.id } });
      await this.offersRepository.save(offer);

      const subscribers = await this.alertService.getSubscribers(user.id);

      const notificationPromises = subscribers.map(sub =>
        this.notificationService.create({
          userId: sub.id,
          title: 'New Offer',
          message: `${user.name} posted a new offer`,
          type: NotificationType.OFFER_ALERT,
          entityType: NotificationEntityType.OFFER,
          entityId: offer.id,
        })
      );

      await Promise.all(notificationPromises);

      await this.notificationService.create({
        userId: offer.contributor.id,
        title: "Pending",
        message: "Your submission is currently being reviewed by our moderation team. This typically takes 2–6 hours. We'll notify you once a decision is made.",
        type: NotificationType.OFFER_PENDING,
        entityType: NotificationEntityType.OFFER,
        entityId: offer.id,
      })

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



  async findAll(query: FindOffersQueryDto) {

    const { search, dealType, category, minRating, createdFrom, createdTo, page = 1, limit = 10 } = query

    const now = new Date();
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (dealType) {
      queryBuilder.andWhere('offer.dealType = :dealType', {
        dealType,
      });
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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };

  }


  async findAllTrending(query: FindOffersQueryDto) {

    const { search, dealType, category, minRating, createdFrom, createdTo, page = 1, limit = 10 } = query
    const havingConditions: string[] = [];
    const params: any = {};
    const now = new Date();
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (dealType) {
      queryBuilder.andWhere('offer.dealType = :dealType', {
        dealType,
      });
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
      havingConditions.push('COALESCE(AVG(review.rating), 0) >= :minRating');
      params.minRating = minRating;
    }

    havingConditions.push('COUNT(DISTINCT click.id) >= :minClicks');
    params.minClicks = 1;

    queryBuilder.having(havingConditions.join(' AND '), params);

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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };

  }

  async findAllExpiring(query: FindOffersQueryDto) {

    const { search, dealType, category, minRating, createdFrom, createdTo, page = 1, limit = 10 } = query
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .andWhere('offer.endDate <= :threeDaysFromNow', { threeDaysFromNow })
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (dealType) {
      queryBuilder.andWhere('offer.dealType = :dealType', {
        dealType,
      });
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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };
  }

  async findAllForAdmin(query: FindOffersQueryDto) {

    const { search, dealType, category, minRating, createdFrom, createdTo, page = 1, limit = 10 } = query

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');


    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (dealType) {
      queryBuilder.andWhere('offer.dealType = :dealType', {
        dealType,
      });
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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };

  }

  async findById(id: string) {
    const offer = await this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .addSelect([
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.profileImageUrl',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug',
      ])
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const reviews = await this.statsService.getReviews(id)
    const clickCount = await this.statsService.getOfferClickCount(id)

    return {
      ...offer,
      ...reviews,
      clickCount
    }
  }

  async findAllByUsername(username: string, query: FindOffersQueryDto) {

    const { search, dealType, category, minRating, createdFrom, createdTo, page = 1, limit = 10 } = query

    const now = new Date();

    const user = await this.userService.getUserByUsername(username);


    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');

    queryBuilder.andWhere('contributor.id = :id', { id: user.id })

    if (search) {
      queryBuilder.andWhere(
        '(offer.title ILIKE :search OR offer.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (dealType) {
      queryBuilder.andWhere('offer.dealType = :dealType', {
        dealType,
      });
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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };

  }

  async findMyOffers(userId: string, query: FindOffersQueryDto) {

    const { tab = MyOffersTab.ALL, page = 1, limit = 10 } = query

    const now = new Date();

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id');

    queryBuilder.andWhere('contributor.id = :id', { id: user.id })

    switch (tab) {
      case MyOffersTab.PENDING:
        queryBuilder.andWhere('offer.status = :status', {
          status: OfferStatus.PENDING,
        });
        break;

      case MyOffersTab.APPROVED:
        queryBuilder
          .andWhere('offer.status = :status', {
            status: OfferStatus.APPROVED,
          })
          .andWhere('offer.endDate > :now', { now });
        break;

      case MyOffersTab.REJECTED:
        queryBuilder.andWhere('offer.status = :status', {
          status: OfferStatus.REJECTED,
        });
        break;

      case MyOffersTab.SUSPENDED:
        queryBuilder.andWhere('offer.status = :status', {
          status: OfferStatus.SUSPENDED,
        });
        break;

      case MyOffersTab.EXPIRED:
        queryBuilder
          .andWhere('offer.status = :status', {
            status: OfferStatus.APPROVED,
          })
          .andWhere('offer.endDate <= :now', { now });
        break;

      case MyOffersTab.ALL:
      default:
        break;
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
      reviewCount: Number(raw[index].reviewCount),
      clickCount: Number(raw[index].clickCount)
    }));

    return {
      data: results,
      meta
    };

  }

  async getMyOfferTabsCount(userId: string) {
    const now = new Date();

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const qb = this.offersRepository
      .createQueryBuilder('offer')
      .where('offer.contributorId = :userId', { userId });

    const result = await qb
      .select([
        `COUNT(*) FILTER (WHERE offer.status = 'pending') AS pending`,
        `COUNT(*) FILTER (WHERE offer.status = 'rejected') AS rejected`,
        `COUNT(*) FILTER (WHERE offer.status = 'suspended') AS suspended`,
        `COUNT(*) FILTER (
        WHERE offer.status = 'approved'
        AND offer.endDate > :now
      ) AS approved`,
        `COUNT(*) FILTER (
        WHERE offer.status = 'approved'
        AND offer.endDate <= :now
      ) AS expired`,
        `COUNT(*) AS all`
      ])
      .setParameter('now', now)
      .getRawOne();

    return {
      all: Number(result.all),
      pending: Number(result.pending),
      approved: Number(result.approved),
      suspended: Number(result.suspended),
      rejected: Number(result.rejected),
      expired: Number(result.expired),
    };
  }

  async getRandomOffers() {
    const now = new Date();

    const idsResult = await this.offersRepository
      .createQueryBuilder('offer')
      .select('offer.id', 'id')
      .where('offer.status = :status', { status: OfferStatus.APPROVED })
      .andWhere('offer.endDate > :now', { now })
      .orderBy('RANDOM()')
      .limit(10)
      .getRawMany();

    const ids = idsResult.map(r => r.id);

    if (ids.length === 0) return [];

    const queryBuilder = this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.reviews', 'review')
      .leftJoin('offer.contributor', 'contributor')
      .leftJoin('offer.category', 'category')
      .leftJoin('offer.clicks', 'click')
      .select([
        'offer',
        'contributor.id',
        'contributor.name',
        'contributor.username',
        'contributor.createdAt',
        'category.id',
        'category.name',
        'category.slug'
      ])
      .addSelect('COALESCE(AVG(review.rating),0)', 'avgRating')
      .addSelect('COALESCE(COUNT(DISTINCT review.id), 0)', 'reviewCount')
      .addSelect('COALESCE(COUNT(DISTINCT click.id), 0)', 'clickCount')
      .where('offer.id IN (:...ids)', { ids })
      .groupBy('offer.id')
      .addGroupBy('contributor.id')
      .addGroupBy('category.id')

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const rawMap = new Map(
      raw.map(r => [r.offer_id, r])
    );

    const results = ids
      .map(id => {
        const entity = entities.find(e => e.id === id);
        if (!entity) return null;

        const rawData = raw.find(r => r.offer_id === id || r.id === id);

        return {
          ...entity,
          avgRating: rawData ? Number(rawData.avgRating) : 0,
          reviewCount: rawData ? Number(rawData.reviewCount) : 0,
          clickCount: rawData ? Number(rawData.clickCount) : 0
        };
      })
      .filter(Boolean);

    return results;

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
      relations: ['contributor'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.contributor.id !== userId) {
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
      relations: ['contributor', 'comments', 'reviews', 'wishlists'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.contributor.id !== userId) {
      throw new NotFoundException('You can only delete your own offers');
    }

    return this.offersRepository.remove(offer);
  }

  private checkUserStatus(user: User) {
    if (user.status === UserStatus.DELETED) {
      throw new ForbiddenException('User not found');
    }
    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException('Your account has been banned, you cannot create offers');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Your account has been suspended, you cannot create offers');
    }
  }

}
