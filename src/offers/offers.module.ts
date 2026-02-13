import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertModule } from 'src/alert/alert.module';
import { CommonModule } from 'src/common/common.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { Category } from './entities/category.entity';
import { Offer } from './entities/offer.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Category]),
    JwtModule.register({}),
    CommonModule,
    UsersModule,
    AlertModule,
    NotificationsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})

export class OffersModule { }
