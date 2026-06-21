import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { UserRole, UserStatus } from 'src/common/types/enums';
import { StatsService } from 'src/stats/stats.service';
import { Repository } from 'typeorm';
import { FindUsersQueryDto } from './dto/find-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly paginationService: PaginationService,
        private readonly statsService: StatsService,
    ) { }

    async create(user: Partial<User>) {
        try {
            const newUser = this.userRepository.create(user);
            await this.userRepository.save(newUser);

            return newUser

        } catch (error) {
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async checkUsername(username: string) {

        username = username.trim().toLowerCase();

        const exists = await this.userRepository.exists({
            where: { username },
        });

        if (exists) {
            return {
                available: false,
                suggestion: await this.generateUniqueUsername(username),
        
            };
        }

        return {
            available: true,
            suggestions: null,
        };
    }

    async update(userId: string, dto: UpdateUserDto) {

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (dto.username && dto.username !== user.username) {
            const now = new Date();

            if (
                user.usernameChangeLockedUntil &&
                now < user.usernameChangeLockedUntil
            ) {
                const remainingDays = Math.ceil(
                    (user.usernameChangeLockedUntil.getTime() -
                        now.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                throw new BadRequestException(
                    `You can change your username again in ${remainingDays} day(s)`,
                );
            }

            const newUsername = dto.username
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_+|_+$/g, '');

            const exists = await this.userRepository.exists({
                where: { username: newUsername },
            });

            if (exists) {
                throw new BadRequestException(
                    'Username already taken',
                );
            }

            dto.username = newUsername;

            const lockUntil = new Date();
            lockUntil.setDate(lockUntil.getDate() + 60);

            user.usernameChangeLockedUntil = lockUntil;
        }

        Object.assign(user, dto);

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

    async getUserById(id: string) {
        return await this.userRepository.findOne({
            where: { id },
        });
    }


    async findAll(query: FindUsersQueryDto) {

        const { search, status, role, createdFrom, createdTo, page = 1, limit = 10 } = query;

        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user',
            ]);

        // Search comment text
        if (search) {
            queryBuilder.andWhere(
                '(user.name ILIKE :search OR user.email ILIKE :search OR user.bio ILIKE :search OR user.address ILIKE :search OR user.username ILIKE :search)',
                {
                    search: `%${search}%`,
                },
            );
        }

        // Status filter
        if (status) {
            queryBuilder.andWhere(
                'user.status = :status',
                { status },
            );
        }

        if (role) {
            queryBuilder.andWhere(
                'user.role = :role',
                { role },
            );
        }

        // Date filters
        if (createdFrom) {
            queryBuilder.andWhere(
                'user.createdAt >= :createdFrom',
                {
                    createdFrom: new Date(createdFrom),
                },
            );
        }

        if (createdTo) {
            queryBuilder.andWhere(
                'user.createdAt <= :createdTo',
                {
                    createdTo: new Date(createdTo),
                },
            );
        }

        queryBuilder
            .orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const countQuery = queryBuilder
            .clone()
            .skip(undefined)
            .take(undefined)
            .orderBy();

        const total = await countQuery.getCount();

        const meta = this.paginationService.getPaginationMeta(
            page,
            limit,
            total,
        );

        const users = await queryBuilder.getMany();

        return {
            data: users,
            meta,
        };
    }



    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email: email.trim().toLowerCase() },
        });

    }

    async getUserByUsername(username: string) {

        const user = await this.userRepository.findOne({
            where: { username },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const [numOfDealPosted, offerClicks] = await Promise.all([
            this.statsService.getUserOfferCount(user.id),
            this.statsService.getUserOfferClicksCount(user.id),
        ]);

        const profile = plainToInstance(User, {
            ...user,
            numOfDealPosted,
            offerClicks,
        });

        return profile;
    }

    async save(user: User) {
        return this.userRepository.save(user);
    }

    async generateUniqueUsername(email: string): Promise<string> {
        const emailPrefix = email.split('@')[0];

        const baseUsername = emailPrefix
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '');

        let username = baseUsername || 'user';
        let counter = 1;

        while (
            await this.userRepository.exists({
                where: { username },
            })
        ) {
            username = `${baseUsername}_${counter}`;
            counter++;
        }

        return username;
    }


    async updateStatus(userId: string, status: UserStatus) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            if (user.role === UserRole.ADMIN) {
                throw new BadRequestException('Cannot update status of another admin');
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


}
