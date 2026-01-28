import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':offerId')
  @UseGuards(AuthGuard)
  addToWishlist(@CurrentUser() user, @Param('offerId') offerId: string) {
    return this.wishlistService.addToWishlist(user.id, offerId);
  }

  @Get()
  @UseGuards(AuthGuard)
  viewWishlist(@CurrentUser() user, @Query('page') page: number, @Query('limit') limit: number) {
    return this.wishlistService.viewWishlist(user.id, page, limit);
  }
}

