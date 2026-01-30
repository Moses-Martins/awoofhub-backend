import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import { BusinessCategory, UserRole } from 'src/common/types/enums';
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
  @Column()
  password: string;

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

  @Column({ type: 'text', nullable: true })
  businessDescription?: string;

  @Column({ type: 'json', nullable: true })
  socialLinks?: string[];

  @Column({ type: 'text', nullable: true })
  businessAddress?: string;

  @Column({ type: 'text', nullable: true })
  businessEmail?: string;

  @Column({ type: 'enum', enum: BusinessCategory, nullable: true })
  businessCategory?: BusinessCategory;

  @OneToMany(() => Offer, offer => offer.business)
  offers: Offer[];

  @OneToMany(() => Offer, offer => offer.approved_by)
  approvals: Offer[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user, { cascade: true })
  wishlist: Wishlist[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}
