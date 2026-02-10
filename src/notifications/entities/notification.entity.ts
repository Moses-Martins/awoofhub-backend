import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.notifications)
    user: User;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
