import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':offerId')
  @UseGuards(AuthGuard)
  addReview(@CurrentUser() user, @Param('offerId') offerId: string, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.addReview(user.id, offerId, createReviewDto);
  }

  @Get('offer/:offerId')
  getofferReviews(@Param('offerId') offerId: string, @Query('page') page: number, @Query('limit') limit: number) {
    return this.reviewsService.getofferReviews(offerId, page, limit);
  }
}
