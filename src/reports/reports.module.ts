import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { OffersModule } from 'src/offers/offers.module';
import { UsersModule } from 'src/users/users.module';
import { Report } from './entities/report.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    JwtModule.register({}),
    OffersModule,
    UsersModule,
    CommentsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PaginationService],
  exports: [ReportsService],
})
export class ReportsModule { }
