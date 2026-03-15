import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { UserRole } from "src/common/types/enums";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Get('offer/:offerId')
  getofferReviews(@Param('offerId') offerId: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.reviewsService.getReviews(offerId);
  }

  @Get(':offerId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getUserReview(@CurrentUser() user, @Param('offerId') offerId: string) {
    return this.reviewsService.getUserReview(user.id, offerId)
  }

  @Post(':offerId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  upsertReview(@CurrentUser() user, @Param('offerId') offerId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.upsertReview(user.id, offerId, createReviewDto);
  }

}
