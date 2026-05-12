import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountStatus, UserRole } from 'src/common/types/enums';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(user: CreateUserDto) {
        try {
            const newUser = this.userRepository.create(user);
            await this.userRepository.save(newUser);

            return newUser

        } catch (error) {
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async update(userId: string, dto: UpdateUserDto) {
        try {
            if (dto.role === UserRole.ADMIN) {
                throw new BadRequestException('Cannot assign admin role');
            }

            const user = await this.userRepository.findOne({
                where: { id: userId },
            });


            if (!user) {
                throw new NotFoundException("User not found");
            }

            Object.assign(user, dto);

            return await this.userRepository.save(user);

        } catch (error) {
            throw new InternalServerErrorException("Failed to update user");
        }
    }

    async createGoogleUser(data: Partial<User>) {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    async updateEmailVerification(id: string) {
        try {
            const user = await this.getUserById(id);
            if (!user) {
                throw new InternalServerErrorException('User not found');
            }
            user.isEmailVerified = true;

            // Save the changes back to the database
            return await this.userRepository.save(user);

        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to verify email');
        }
    }

    async getUserStats() {
        const [totalActive, businessActive, suspended, banned] = await Promise.all([
            this.userRepository.count({
                where: { status: AccountStatus.ACTIVE }
            }),
            this.userRepository.count({
                where: { role: UserRole.BUSINESS, status: AccountStatus.ACTIVE }
            }),
            this.userRepository.count({
                where: { status: AccountStatus.SUSPENDED }
            }),
            this.userRepository.count({
                where: { status: AccountStatus.BANNED }
            }),
        ]);

        return { 
            totalActive, 
            businessActive, 
            suspended, 
            banned 
        };
    }

    async getUserById(id: string) {
        return await this.userRepository.findOne({
            where: { id },
        });
    }


    async findAll(): Promise<User[]> {
        const users = this.userRepository.find();
        return users
    }


    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email.trim().toLowerCase() },
        });
    }

    async save(user: User) {
        return this.userRepository.save(user);
    }


    async updateStatus(userId: string, status: AccountStatus) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            user.status = status

            return await this.userRepository.save(user);

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to update user status');
        }
    }

}
