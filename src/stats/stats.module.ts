import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommentsModule } from 'src/comments/comments.module';
import { OffersModule } from 'src/offers/offers.module';
import { ReportsModule } from 'src/reports/reports.module';
import { UsersModule } from 'src/users/users.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    OffersModule,
    ReportsModule,
    CommentsModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }
