import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import { PasswordResetToken } from 'src/auth/entities/password-reset-token.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { AuthProvider, BusinessCategory, UserRole } from 'src/common/types/enums';
import { Offer } from 'src/offers/entities/offer.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import {
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
  profile_image_url?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Exclude({ toPlainOnly: true })
  @Column({ default: false })
  is_email_verified: boolean;

  @Exclude({ toPlainOnly: true })
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  auth_provider: AuthProvider;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  business_description?: string;

  @Column({ type: 'json', nullable: true })
  social_links?: string[];

  @Column({ type: 'text', nullable: true })
  business_email?: string;

  @Column({ type: 'enum', enum: BusinessCategory, nullable: true })
  business_category?: BusinessCategory;

  @OneToMany(() => Offer, offer => offer.business)
  offers: Offer[];

  @OneToMany(() => Offer, offer => offer.approved_by)
  approvals: Offer[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user, { cascade: true })
  wishlist: Wishlist[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[]

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}
