import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertModule } from './alert/alert.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { CommentsModule } from './comments/comments.module';
import { CommonModule } from './common/common.module';
import AppDataSource from './config/typeorm.config';
import { FilesModule } from './files/files.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OffersModule } from './offers/offers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { StatsModule } from './stats/stats.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    MailModule,
    OffersModule,
    ReviewsModule,
    WishlistModule,
    FilesModule,
    ChatModule,
    NotificationsModule,
    AlertModule,
    CommentsModule,
    CategoryModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
