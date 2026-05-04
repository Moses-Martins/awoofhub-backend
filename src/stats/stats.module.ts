import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OffersModule } from 'src/offers/offers.module';
import { UsersModule } from 'src/users/users.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    OffersModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule { }
