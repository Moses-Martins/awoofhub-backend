import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MERCHANT = 'merchant',
}

@Entity('auth')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string; 
    
}