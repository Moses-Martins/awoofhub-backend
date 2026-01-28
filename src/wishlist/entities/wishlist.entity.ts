import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity('wishlist')
export class Wishlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.wishlist)
    user: User;

    @ManyToOne(() => Offer, offer => offer.wishlists)
    offer: Offer;
}

