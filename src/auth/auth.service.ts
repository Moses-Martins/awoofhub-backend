import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto, ResendVerificationMailDto } from './dto/login-user.dto';

interface VerificationTokenPayload {
    email: string;
    sub: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }
    async login(loginUser: LoginUserDto) {
        try {
            const user = await this.userService.getUserByEmail(loginUser.email);

            if (!user) {
                throw new ForbiddenException('User not found');
            }

            const isPasswordValid = await this.verifyPassword(
                loginUser.password,
                user.password
            )

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid email or password');
            }

            if (user.role !== loginUser.role) {
                throw new UnauthorizedException('Invalid role for this user');
            }

            // Don't let unverified users log in
            if (!user.is_email_verified) {
                throw new UnauthorizedException(
                    'Email not verified. Please verify your email before logging in.',
                );
            }

            const accessToken = await this.createAccessToken(user)

            return {
                message: 'Login successful',
                data: {
                    ...instanceToPlain(user), // convert class instance to plain object so @Exclude() works, then safely spread
                    accessToken,
                },
            };

        } catch (error) {
            throw error;
        }
    }

    async signup(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.userService.getUserByEmail(createUserDto.email);
            if (existingUser) {
                throw new BadRequestException('Email already in use');
            }

            const hashedPassword = this.hashPassword(createUserDto.password);
            const newUser: CreateUserDto = {
                ...createUserDto,
                password: hashedPassword,
            };

            const user = await this.userService.create(newUser);

            const verificationToken = await this.createVerificationToken(user)

            this.mailService.sendEmail({
                to: user.email,
                subject: `Welcome, ${user.name}! Please confirm your email`,
                template: 'signup-mail',
                context: {
                    name: user.name,
                    token: verificationToken
                },
            })

            return { message: 'Please check your email for verification link' };


        } catch (error) {
            throw error;
        }
    }


    async resendVerificationMail(dto: ResendVerificationMailDto) {
        const { email } = dto;

        const user = await this.userService.getUserByEmail(email);

        // Security: do not reveal whether email exists
        if (!user) {
            return {
                message: 'If the email exists, a verification link has been sent.',
            };
        }

        if (user.is_email_verified) {
            throw new BadRequestException('Email already verified');
        }

        const verificationToken = await this.createVerificationToken(user);

        await this.mailService.sendEmail({
            to: user.email,
            subject: `Resend: Verify your email`,
            template: 'signup-mail',
            context: {
                name: user.name,
                token: verificationToken,
            },
        });

        return {
            message: 'Verification email sent. Please check your inbox.',
        };
    }


    async verifyEmail(token: string): Promise<{ token: string; user: User }> {
        try {
            // Decode the verification token
            const decoded = this.jwtService.verify<VerificationTokenPayload>(token);
            const user = await this.userService.getUserById(decoded.sub);
            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }

            // Check if already verified
            if (user.is_email_verified) {
                throw new BadRequestException('Email already verified');
            }

            // Mark email as verified
            await this.userService.updateEmailVerification(user.id);


            // Get updated user and generate access token
            const updatedUser = await this.userService.getUserById(user.id);
            if (!updatedUser) {
                throw new UnauthorizedException('User not found after verification');
            }

            const accessToken = await this.createAccessToken(updatedUser);

            return { token: accessToken, user: updatedUser };
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid or expired verification token');
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

    private createAccessToken(user: User): Promise<string> {
        const payload = { email: user.email, sub: user.id };
        return this.jwtService.signAsync(payload);
    }

    private createVerificationToken(user: User): Promise<string> {
        const payload = { email: user.email, sub: user.id };

        // Verification tokens are short-lived
        return this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });
    }


}


