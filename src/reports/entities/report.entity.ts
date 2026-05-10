import { ReportStatus, ReportType, TargetType } from "src/common/types/enums";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ReportType,
    })
    type: ReportType;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: TargetType,
    })
    targetType: TargetType;

    @Column()
    targetId: string;

    @ManyToOne(() => User, (reporter) => reporter.reports, { onDelete: 'CASCADE' })
    reporter: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
    status: ReportStatus;

}
