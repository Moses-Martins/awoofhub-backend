import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenPurpose, UserRole } from 'src/common/types/enums';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { EmailDto, LoginUserDto } from './dto/login-user.dto';


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
            const refreshToken = await this.createRefreshToken(user);

            return { user, accessToken, refreshToken };

        } catch (error) {
            throw error;
        }
    }

    async signup(createUser: CreateUserDto) {
        try {
            if (createUser.role === UserRole.ADMIN) {
                throw new BadRequestException('Cannot assign admin role via signup');
            }

            const existingUser = await this.userService.getUserByEmail(createUser.email);
            if (existingUser) {
                throw new BadRequestException('Email already in use');
            }

            const hashedPassword = this.hashPassword(createUser.password);
            const newUser: CreateUserDto = {
                ...createUser,
                password: hashedPassword,
            };

            const user = await this.userService.create(newUser);

            const verificationToken = await this.createToken(user, TokenPurpose.EMAIL_VERIFICATION)

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


    async resendVerificationMail(dto: EmailDto) {
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

        const verificationToken = await this.createToken(user, TokenPurpose.EMAIL_VERIFICATION)

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
            message: 'If the email exists, a verification link has been sent.',
        };
    }


    async verifyEmail(token: string) {
        try {
            // Decode the verification token
            const decoded = await this.verifyToken(token, TokenPurpose.EMAIL_VERIFICATION);

            const user = await this.userService.getUserById(decoded.sub);
            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }

            // Check if already verified
            if (user.is_email_verified) {
                throw new BadRequestException('Email already verified');
            }

            // Mark email as verified
            const updatedUser = await this.userService.updateEmailVerification(user.id);

            const accessToken = await this.createAccessToken(updatedUser);

            return { updatedUser, accessToken };

        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid or expired verification token');
        }
    }


    async verifyRefreshToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token);

            if (payload.tokenType !== 'refresh') {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return payload;
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async forgotPassword(dto: EmailDto) {
        const { email } = dto
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            throw new NotFoundException("If the email exists, a reset link has been sent.");
        }

        const resetToken = await this.createToken(user, TokenPurpose.PASSWORD_RESET);

        await this.mailService.sendEmail({
            to: user.email,
            subject: `Reset password`,
            template: 'password-reset-mail',
            context: {
                name: user.name,
                token: resetToken,
            },
        });

        return {
            message: 'If the email exists, a reset link has been sent.',
        };

    }

    async resetPassword(token: string, password: string) {

        const decoded = await this.verifyToken(token, TokenPurpose.PASSWORD_RESET);

        const user = await this.userService.getUserByEmail(decoded.email);
        if (!user) {
            throw new ForbiddenException('User not found');
        }

        user.password = this.hashPassword(password);

        await this.userService.save(user);

        return { 
            message: 'Password reset successful' 
        };

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

    public createAccessToken(user: User): Promise<string> {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });
    }


    private createRefreshToken(user: User): Promise<string> {
        const payload = { sub: user.id, tokenType: 'refresh' }

        return this.jwtService.signAsync(payload, {
            expiresIn: '7d'
        });
    }

    private createToken(user: User, purpose: TokenPurpose): Promise<string> {
        const payload = { email: user.email, sub: user.id, purpose };

        // Verification tokens are short-lived
        return this.jwtService.signAsync(payload, {
            expiresIn: '15m',
        });
    }

    private verifyToken(token: string, expectedPurpose: TokenPurpose) {
        const payload = this.jwtService.verify(token);

        if (payload.purpose !== expectedPurpose) {
            throw new UnauthorizedException('Invalid token purpose');
        }

        return payload;
    }


}


