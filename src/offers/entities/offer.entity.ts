import { Category } from 'src/category/entities/category.entity';
import { Comment } from 'src/comments/entities/comment.entity';
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


@Entity('offers')
export class Offer {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    title: string;

    @Column('text')
    highlight: string;

    @Column('text')
    description: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @ManyToOne(() => User, (business) => business.offers, { onDelete: 'CASCADE' })
    business: User;

    @ManyToOne(() => Category, category => category.offers)
    category: Category;

    @Column('text')
    location: string;

    @Column('text')
    termsAndConditions: string;

    @Column('text')
    value: string;

    @Column('text')
    dealUrl: string;

    @Column({ nullable: true })
    couponCode?: string;

    @Column({
        type: 'enum',
        enum: ApprovalStatus,
        default: ApprovalStatus.PENDING,
    })
    approvalStatus: ApprovalStatus;

    @Column({ type: 'text', nullable: true, })
    adminNote?: string;

    @Column({ type: 'timestamp', nullable: true })
    approvedAt?: Date;

    @ManyToOne(() => User, (admin) => admin.approvals)
    approvedBy?: User;

    @OneToMany(() => Review, review => review.offer)
    reviews: Review[];

    @OneToMany(() => Comment, comment => comment.offer)
    comments: Comment[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.offer, { cascade: true })
    wishlists: Wishlist[];

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

}
