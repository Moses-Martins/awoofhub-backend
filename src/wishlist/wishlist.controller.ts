import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Post(':offerId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  addToWishlist(@CurrentUser() user, @Param('offerId') offerId: string) {
    return this.wishlistService.addToWishlist(user.id, offerId);
  }

  @Get()
  @UseGuards(AuthGuard)
  viewWishlist(@CurrentUser() user, @Query('page') page: number, @Query('limit') limit: number) {
    return this.wishlistService.viewWishlist(user.id, page, limit);
  }
}

