import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/types/enums';

import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':offerId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Add offer to wishlist',
  })
  @ApiParam({
    name: 'offerId',
    type: String,
    description: 'Offer ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 201,
    description: 'Offer added to wishlist successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  addToWishlist(
    @CurrentUser() user,
    @Param('offerId') offerId: string,
  ) {
    return this.wishlistService.addToWishlist(
      user.id,
      offerId,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'View authenticated user wishlist',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  viewWishlist(@CurrentUser() user) {
    return this.wishlistService.viewWishlist(user.id);
  }

  @Delete(':offerId')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Remove offer from wishlist',
  })
  @ApiParam({
    name: 'offerId',
    type: String,
    description: 'Offer ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer removed from wishlist successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  remove(
    @CurrentUser() user,
    @Param('offerId') offerId: string,
  ) {
    return this.wishlistService.removeFromWishlist(
      user.id,
      offerId,
    );
  }
}