import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import { Alert } from 'src/alert/entities/alert.entity';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { AuthProvider, UserRole } from 'src/common/types/enums';
import { Notification } from 'src/notifications/entities/notification.entity';
import { Offer } from 'src/offers/entities/offer.entity';
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

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Exclude({ toPlainOnly: true })
  @MinLength(6)
  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Exclude({ toPlainOnly: true })
  @Column({ default: false })
  isEmailVerified: boolean;

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

  @OneToMany(() => Offer, offer => offer.moderatedBy)
  approvals: Offer[];

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

  @CreateDateColumn()
  createdAt: Date;

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
