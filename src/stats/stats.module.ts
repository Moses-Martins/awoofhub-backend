import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Click } from 'src/clicks/entities/click.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, User, Click, Comment, Review, Report]),
    JwtModule.register({}),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule { }
