import { Offer } from 'src/offers/entities/offer.entity';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => Offer, offer => offer.category)
    offers: Offer[];

    @CreateDateColumn()
    createdAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    normalizeName() {
        if (this.name) {
            this.name = this.name.trim().toLowerCase();
        }
    }
}
