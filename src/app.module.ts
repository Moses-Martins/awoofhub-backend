import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
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
import { ModerationModule } from './moderation/moderation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OffersModule } from './offers/offers.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
      dataSourceFactory: async (options) => {
        if (!options) {
	         throw new Error('Invalid options passed');
	       }
        return addTransactionalDataSource(new DataSource(options));
      }
    }),
    ScheduleModule.forRoot(),
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
    ReportsModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
