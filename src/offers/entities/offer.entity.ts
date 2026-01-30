import { ApprovalStatus } from 'src/common/types/enums';
import { Review } from 'src/reviews/entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Category } from './category.entity';

@Entity('offers')
export class Offer {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    title: string;

    @Column('text')
    description: string;

    @Column('decimal', { default: 0.0 })
    price: number;

    @Column({ nullable: true })
    image_url?: string;

    @ManyToOne(() => User, (business) => business.offers, { onDelete: 'CASCADE' })
    business: User;

    @ManyToOne(() => Category, category => category.offers)
    category: Category;

    @Column({ nullable: true })
    location: string;

    @Column({
        type: 'enum',
        enum: ApprovalStatus,
        default: ApprovalStatus.PENDING,
    })
    approvalStatus: ApprovalStatus;

    @Column({ type: 'text', nullable: true, })
    admin_note?: string;

    @Column({ type: 'timestamp', nullable: true })
    approved_at?: Date;

    @ManyToOne(() => User, (admin) => admin.approvals)
    approved_by?: User;

    @OneToMany(() => Review, review => review.offer)
    reviews: Review[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.offer, { cascade: true })
    wishlists: Wishlist[];

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp' })
    end_date: Date;

}
