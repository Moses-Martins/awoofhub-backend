import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';


@Entity('clicks')
export class Click {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.clicks)
    user: User;

    @ManyToOne(() => Offer, offer => offer.clicks, { onDelete: 'CASCADE' })
    offer: Offer;

    @CreateDateColumn()
    createdAt: Date;

}

