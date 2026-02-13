import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { Alert } from './entities/alert.entity';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Alert]),
  ],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule { }
