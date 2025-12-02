import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private jwtService: JwtService,
    ) { }
    async login(loginUser: LoginUserDto) {
        try {
            const user = await this.userService.getUserByEmail(loginUser.email);

            if (!user) {
                throw new ForbiddenException('User not found');
            }

            if (await this.verifyPassword(
                loginUser.password,
                user.password
            )) {
                // Remove the password field before returning the user object to avoid exposing sensitive information
                const { password, ...safeUser } = user;
                const accessToken =
                    await this.jwtService.signAsync
                        ({
                            sub: safeUser.id,
                            email: safeUser.email,
                        });
                return {
                    message: 'Login successful',
                    data: {
                        ...safeUser,
                        accessToken,
                    },
                };
            }

            throw new UnauthorizedException('Invalid username or password');

        } catch (error) {
            throw error;
        }
    }
    async signup(createUserDto: CreateUserDto) {
        try {
            const hashedPassword = this.hashPassword(createUserDto.password);
            const newUser: CreateUserDto = {
                ...createUserDto,
                password: hashedPassword,
            };
            return await this.userService.create(newUser);
        } catch (error) {
            throw error;
        }
    }

    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }

    async verifyPassword(
        password: string,
        hashedPassword: string
    ) {
        return bcrypt.compare(
            password, hashedPassword
        );
    }
}


