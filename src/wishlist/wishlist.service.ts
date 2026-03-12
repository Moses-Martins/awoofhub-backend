import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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


  async viewWishlist(userId: string) {

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
        'user.id', 'user.name', 'user.profileImageUrl',
        'offer',
      ])
      .where('user.id = :userId', { userId: user.id })
      .orderBy('wishlist.id', 'ASC')
      .getMany();

    return wishlists

  }


  async removeFromWishlist(userId: string, offerId: string) {

    const result = await this.wishlistRepository.delete({
      offer: { id: offerId },
      user: { id: userId }
    });

    if (result.affected === 0) {
      throw new NotFoundException("Offer not found in wishlist");
    }

    return {}
    
  }


}

