import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

            return newUser
            
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async updateEmailVerification(id: string) {
        try {
            const user = await this.getUserById(id);
            if (!user) {
                throw new InternalServerErrorException('User not found');
            }
            user.is_email_verified = true; 

            // Save the changes back to the database
            return await this.userRepository.save(user);
            
        } catch (error) {
            throw new InternalServerErrorException('Failed to verify email');
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

}
