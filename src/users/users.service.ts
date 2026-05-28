import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { UserRole, UserStatus } from 'src/common/types/enums';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersQueryDto } from './dto/find-user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly paginationService: PaginationService,
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
                where: { status: UserStatus.ACTIVE }
            }),
            this.userRepository.count({
                where: { role: UserRole.BUSINESS, status: UserStatus.ACTIVE }
            }),
            this.userRepository.count({
                where: { status: UserStatus.SUSPENDED }
            }),
            this.userRepository.count({
                where: { status: UserStatus.BANNED }
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
                '(user.name ILIKE :search OR user.email ILIKE :search OR user.bio ILIKE :search OR user.address ILIKE :search OR user.website ILIKE :search)',
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

        // Get total count without pagination
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

    async save(user: User) {
        return this.userRepository.save(user);
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
