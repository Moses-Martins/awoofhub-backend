import { NotificationType } from "src/common/types/enums";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.notifications)
    user: User;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ nullable: true })
    entityId: string;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
