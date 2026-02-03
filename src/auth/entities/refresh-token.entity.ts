import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    tokenHash: string

    @Column({ type: 'timestamp' })
    expiresAt: Date

    @Column({ default: false })
    revoked: boolean;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    user: User

}