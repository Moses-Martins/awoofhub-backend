import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OffersModule } from 'src/offers/offers.module';
import { UsersModule } from 'src/users/users.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    UsersModule,
    OffersModule,
    JwtModule.register({}),
  ],

  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule { }


