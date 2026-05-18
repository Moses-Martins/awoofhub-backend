import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import { Alert } from 'src/alert/entities/alert.entity';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { AuthProvider, UserRole, UserStatus } from 'src/common/types/enums';
import { Moderation } from 'src/moderation/entities/moderation.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Column()
  name: string;

  @ApiProperty({ required: false })
  @Exclude({ toPlainOnly: true })
  @MinLength(6)
  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, default: UserStatus.ACTIVE })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Exclude({ toPlainOnly: true })
  @Column({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ enum: AuthProvider, default: AuthProvider.LOCAL })
  @Exclude({ toPlainOnly: true })
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'json', nullable: true })
  website?: string;

  @OneToMany(() => Offer, offer => offer.business)
  offers: Offer[];

  @OneToMany(() => Report, report => report.reporter)
  reports: Report[];

  @OneToMany(() => Moderation, moderate => moderate.admin)
  moderate: Moderation[];

  @OneToMany(() => Alert, (alert) => alert.user)
  createdAlerts: Alert[];

  @OneToMany(() => Alert, (alert) => alert.business)
  receivedAlerts: Alert[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user, { cascade: true })
  wishlist: Wishlist[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[]

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.trim().toLowerCase();
    }
  }
}