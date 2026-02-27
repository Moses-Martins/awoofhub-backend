import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertService } from 'src/alert/alert.service';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { NotificationType } from 'src/common/types/enums';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Category } from './entities/category.entity';
import { Offer } from './entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private readonly paginationService: PaginationService,
    private readonly notificationService: NotificationsService,
    private readonly userService: UsersService,
    private readonly alertService: AlertService,
  ) { }

  async create(createOfferDto: CreateOfferDto, id: string) {
    try {

      const { category, endDate, ...rest } = createOfferDto;
      const existing = await this.categoriesRepository.findOneBy({ name: category.trim().toLowerCase() });
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

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {


    const name = createCategoryDto.name.trim().toLowerCase();

    const existingCategory = await this.categoriesRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException(`Category '${name}' already exists`);
    }

    const category = this.categoriesRepository.create({ name });
    try {
      return this.categoriesRepository.save(category);

    } catch (error) {
      throw new InternalServerErrorException('Failed to create category');
    }

  }

  async findAll(page = 1, limit = 10) {
    const [offers, total] = await this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id', 'business.name', 'business.email',
        'category.id', 'category.name',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data: offers,
      meta
    };
  }

  async findById(id: string): Promise<Offer> {

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
      ])
      .where('offer.id = :id', { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async searchOffers(query: string, page = 1, limit = 10) {
    const results = await this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id', 'business.name', 'business.email',
        'category.id', 'category.name',
      ])
      .where('offer.title ILIKE :query', { query: `%${query}%` })
      .orWhere('offer.description ILIKE :query', { query: `%${query}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const total = await this.offersRepository.createQueryBuilder('offer').where('offer.title ILIKE :query OR offer.description ILIKE :query', { query: `%${query}%` }).getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data: results,
      meta
    }
  }

  async filter(category?: string, minPrice?: number, maxPrice?: number, minRating?: number, page = 1, limit = 10) {

    let queryBuilder = this.offersRepository
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
      .addSelect('AVG(review.rating)', 'avgRating')
      .groupBy('offer.id')
      .addGroupBy('business.id')
      .addGroupBy('category.id')
      .skip((page - 1) * limit)
      .take(limit);

    if (category) {
      const existing = await this.categoriesRepository.findOneBy({ name: category });
      if (existing) {
        queryBuilder = queryBuilder.andWhere('offer.categoryId = :categoryId', { categoryId: existing.id });
      }
    }

    if (minPrice) {
      queryBuilder = queryBuilder.andWhere('offer.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder = queryBuilder.andWhere('offer.price <= :maxPrice', { maxPrice });
    }

    if (minRating) {
      queryBuilder.having('AVG(review.rating) >= :minRating', { minRating });
    }

    const total = await queryBuilder.clone().getCount();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const results = entities.map((offer, index) => ({
      ...offer,
      avgRating: Number(raw[index].avgRating),
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

    const offers = await this.offersRepository
      .createQueryBuilder('offer')
      .leftJoin('offer.business', 'business')
      .leftJoin('offer.category', 'category')
      .select([
        'offer',
        'business.id', 'business.name', 'business.email',
        'category.id', 'category.name',
      ])
      .whereInIds(ids)
      .getMany();

    const total = await this.offersRepository.count();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data: offers,
      meta,
    };
  }

}
