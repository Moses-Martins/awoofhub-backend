import { ModerationActionType, TargetType } from "src/common/types/enums";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('moderation')
export class Moderation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TargetType,
    })
    targetType: TargetType;

    @Column()
    targetId: string;

    @Column({
        type: 'enum',
        enum: ModerationActionType,
    })
    actionType: ModerationActionType;

    @Column({
        type: 'text',
        nullable: true,
    })
    reason?: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    reportId?: string;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    endsAt?: Date;

    @ManyToOne(() => User, (admin) => admin.moderate)
    admin: User;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
