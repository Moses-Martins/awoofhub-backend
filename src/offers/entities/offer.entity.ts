import { Category } from 'src/category/entities/category.entity';
import { Click } from 'src/clicks/entities/click.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { DealType, OfferStatus } from 'src/common/types/enums';
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
    description: string;

    @Column('text')
    imageUrl: string;

    @ManyToOne(() => User, (user) => user.offers, { onDelete: 'CASCADE' })
    contributor: User;

    @ManyToOne(() => Category, category => category.offers)
    category: Category;

    @Column('text')
    location: string;

    @Column('text')
    value: string;

    @Column('text')
    externalLink: string;

    @Column('text')
    brandName: string;

    @Column({ nullable: true })
    couponCode?: string;

    @Column({ type: 'enum', enum: DealType })
    dealType: DealType;

    @Column({
        type: 'enum',
        enum: OfferStatus,
        default: OfferStatus.PENDING,
    })
    status: OfferStatus;

    @OneToMany(() => Review, review => review.offer)
    reviews: Review[];

    @OneToMany(() => Comment, comment => comment.offer)
    comments: Comment[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.offer, { cascade: true })
    wishlists: Wishlist[];

    @OneToMany(() => Click, click => click.offer)
    clicks: Click[]

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

}
