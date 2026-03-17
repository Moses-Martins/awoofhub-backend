import { Offer } from "src/offers/entities/offer.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comments')
export class Comment {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    comment: string;

    @ManyToOne(() => User, user => user.comments)
    user: User;

    @ManyToOne(() => Offer, offer => offer.comments)
    offer: Offer;

    @CreateDateColumn()
    createdAt: Date;

}