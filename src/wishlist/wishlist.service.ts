import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { OffersService } from 'src/offers/offers.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private usersService: UsersService,
    private offersService: OffersService,
    private readonly paginationService: PaginationService,
  ) { }

  async addToWishlist(userId: string, offerId: string): Promise<Wishlist> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const offer = await this.offersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Product not found');
    }

    const existingWishlist = await this.wishlistRepository.findOne({
      where: {
        offer: { id: offer.id },
        user: { id: user.id }
      },
    });

    if (existingWishlist) {
      throw new BadRequestException('Offer already in wishlist!');
    }

    const wishlistItem = this.wishlistRepository.create({ user: { id: user.id }, offer: { id: offer.id } });
    return this.wishlistRepository.save(wishlistItem);
  }


  async viewWishlist(userId: string, page = 1, limit = 10) {

    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wishlists = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .leftJoin('wishlist.user', 'user')
      .leftJoin('wishlist.offer', 'offer')
      .select([
        'wishlist',
        'user.id', 'user.name', 'user.profile_image_url',
        'offer.id', 'offer.title', 'offer.description',
      ])
      .where('user.id = :userId', { userId: user.id })
      .orderBy('wishlist.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();


    const total = await this.wishlistRepository.count();
    const meta = this.paginationService.getPaginationMeta(page, limit, total);

    return {
      data: wishlists,
      meta
    };
  }
}

