import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  BUSINESS = 'business',
}

@Entity('users')
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Exclude({ toPlainOnly: true })
  @MinLength(6)
  @Column()
  password: string;

  @Column({ nullable: true })
  profile_image_url?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
  
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ default: false })
  is_email_confirmed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

}
