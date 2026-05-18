import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { UserStatusGuard } from 'src/common/guards/user-status.guard';
import { UserRole } from 'src/common/types/enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('offer/:offerId')
  @ApiOperation({ summary: 'Get all reviews for an offer' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID', example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'Reviews fetched successfully' })
  getofferReviews(@Param('offerId') offerId: string) {
    return this.reviewsService.getReviews(offerId);
  }

  @Get(':offerId')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get authenticated user review for an offer' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID', example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'User review fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserReview(@CurrentUser() user, @Param('offerId') offerId: string) {
    return this.reviewsService.getUserReview(user.id, offerId);
  }

  @Post(':offerId')
  @UseGuards(AuthGuard, UserStatusGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Create or update review for an offer' })
  @ApiParam({ name: 'offerId', type: String, description: 'Offer ID', example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  upsertReview(@CurrentUser() user, @Param('offerId') offerId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.upsertReview(user.id, offerId, createReviewDto);
  }
}