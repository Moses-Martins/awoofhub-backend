import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
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
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})

export class OffersModule { }
