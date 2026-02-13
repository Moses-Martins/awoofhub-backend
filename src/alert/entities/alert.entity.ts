import { User } from "src/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.createdAlerts)
    user: User;

    @ManyToOne(() => User, (user) => user.receivedAlerts)
    business: User;

    @CreateDateColumn()
    createdAt: Date;
}
