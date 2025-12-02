import { ApiProperty } from '@nestjs/swagger';
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
  MERCHANT = 'merchant',
}

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'john_doe', description: 'Username of the user' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    example: 'StrongP@ssword1',
    description: 'Hashed password of the user',
  })
  @Column()
  password: string;

  @ApiProperty({
    example: UserRole.USER,
    description: 'Role of the user',
    enum: UserRole,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    example: '2025-12-01T13:30:00Z',
    description: 'Date when the user was created',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    example: '2025-12-01T14:00:00Z',
    description: 'Date when the user was last updated',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
