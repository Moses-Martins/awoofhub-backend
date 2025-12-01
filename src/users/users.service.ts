import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
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

            return newUser;
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Email already exists');
            }

            throw new InternalServerErrorException('Failed to create user');

        }
    }

    async getUserById(id: string) {
        return await this.userRepository.findOne({
            where: { id },
        });
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
        });
    }

    async getUserByUsername(username: string) {
        return await this.userRepository.findOne({
            where: { username },
        });
    }

}
