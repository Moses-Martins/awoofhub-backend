import { Offer } from "src/offers/entities/offer.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @ManyToOne(() => User, user => user.reviews)
    user: User;

    @ManyToOne(() => Offer, offer => offer.reviews)
    offer: Offer;

}
