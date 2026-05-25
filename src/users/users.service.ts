import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType, UserRole, UserStatus } from 'src/common/types/enums';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @Inject(forwardRef(() => NotificationsService))
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(user: CreateUserDto) {
        try {
            const newUser = this.userRepository.create(user);
            await this.userRepository.save(newUser);
            return newUser;
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
            const updatedUser = await this.userRepository.save(user);
        await this.notificationsService.create(
            userId,
            'Profile Updated',
            'Your profile has been updated succesfully',
            NotificationType.PROFILE_UPDATED,
            userId,
        );
            return updatedUser;

        } catch (error) {
            if(error instanceof BadRequestException || error instanceof NotFoundException){
                throw error;
            }
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
            return await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to verify email');
        }
    }

    async getUserStats() {
        const [totalActive, businessActive, suspended, blocked] = await Promise.all([
            this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
            this.userRepository.count({ where: { role: UserRole.BUSINESS, status: UserStatus.ACTIVE } }),
            this.userRepository.count({ where: { status: UserStatus.SUSPENDED } }),
            this.userRepository.count({ where: { status: UserStatus.BLOCKED } }),
        ]);

        return { totalActive, businessActive, suspended, blocked };
    }

    async getUserById(id: string) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email.trim().toLowerCase() },
        });
    }

    async save(user: User) {
        return this.userRepository.save(user);
    }

    async remove(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.status = UserStatus.DELETED;

        return this.userRepository.save(user);
    }

    async updateStatus(userId: string, status: UserStatus) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.status = status;
        await this.userRepository.save(user);
    }
}