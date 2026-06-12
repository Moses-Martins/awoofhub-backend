import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersModule } from 'src/offers/offers.module';
import { UsersModule } from 'src/users/users.module';
import { ClicksController } from './clicks.controller';
import { ClicksService } from './clicks.service';
import { Click } from './entities/click.entity';

@Module({
   imports: [
      TypeOrmModule.forFeature([Click]),
      JwtModule.register({}),
      UsersModule,
      OffersModule,
    ],
  controllers: [ClicksController],
  providers: [ClicksService],
  exports: [ClicksService],
})
export class ClicksModule {}
