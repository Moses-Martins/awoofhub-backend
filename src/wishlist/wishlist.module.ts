import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersModule } from 'src/offers/offers.module';
import { UsersModule } from 'src/users/users.module';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist]),
    JwtModule.register({}),
    UsersModule,
    OffersModule, 
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
