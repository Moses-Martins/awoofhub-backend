import { User } from "src/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class Conversation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.startedConversations)
    initiator: User;

    @ManyToOne(() => User, user => user.joinedConversations)
    participant: User;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Message, message => message.conversation)
    messages: Message[];
}
