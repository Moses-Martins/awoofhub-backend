import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { TokenPurpose, UserRole } from 'src/common/types/enums';
import { MailService } from 'src/mail/mail.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { DataSource, Repository } from 'typeorm';
import { EmailDto, LoginUserDto } from './dto/login-user.dto';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';


@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private mailService: MailService,
        private dataSource: DataSource,
        private readonly userService: UsersService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        @InjectRepository(PasswordResetToken)
        private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,

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
            const refreshToken = await this.createRefreshToken(user.id);

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
                password: await hashedPassword,
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
            const refreshToken = await this.createRefreshToken(user.id);


            return { updatedUser, accessToken, refreshToken };

        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid or expired verification token');
        }
    }


    async refreshToken(token: string) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const refreshTokenEntity = await this.refreshTokenRepository.findOne({
            where: {
                tokenHash,
                revoked: false,
            },
            relations: ['user'],
        });

        if (!refreshTokenEntity) {
            throw new UnauthorizedException('Invalid refresh token')
        }

        if (refreshTokenEntity.expiresAt < new Date()) {
            refreshTokenEntity.revoked = true;
            await this.refreshTokenRepository.save(refreshTokenEntity);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = refreshTokenEntity.user;
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { accessToken, refreshToken } =
            await this.dataSource.transaction(async (manager) => {
                refreshTokenEntity.revoked = true;
                await manager.save(refreshTokenEntity);

                const accessToken = await this.createAccessToken(user);
                const refreshToken = await this.createRefreshToken(user.id);

                return { accessToken, refreshToken };
            });

        return {
            accessToken,
            refreshToken
        }
    }

    async forgotPassword(dto: EmailDto) {
        const { email } = dto
        const user = await this.userService.getUserByEmail(email);

        if (user) {
            
            const resetToken = await this.createPasswordResetToken(user.id);

            await this.mailService.sendEmail({
                to: user.email,
                subject: `Reset password`,
                template: 'password-reset-mail',
                context: {
                    name: user.name,
                    token: resetToken,
                },
            });

        } 

        return {
            message: 'If the email exists, a reset link has been sent.',
        };

    }

    async resetPassword(token: string, password: string) {

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const passwordResetToken = await this.passwordResetTokenRepository.findOne({
            where: {
                tokenHash,
                used: false,
            },
            relations: ['user'],
        });

        if (!passwordResetToken) {
            throw new UnauthorizedException('Invalid password reset token')
        }

        if (passwordResetToken.expiresAt < new Date()) {
            passwordResetToken.used = true;
            await this.passwordResetTokenRepository.save(passwordResetToken);
            throw new UnauthorizedException('Password reset token expired');
        }

        const user = passwordResetToken.user;
        if (!user) {
            throw new ForbiddenException('User not found');
        }

        await this.dataSource.transaction(async (manager) => {
            // mark all tokens as used
            await manager.update(
                PasswordResetToken,
                { user: { id: user.id }, used: false },
                { used: true }
            );

            user.password = await this.hashPassword(password);
            await manager.save(user);
        });

        await this.refreshTokenRepository.update(
            { user: { id: user.id }, revoked: false },
            { revoked: true }
        );

        return {
            message: 'Password reset successful'
        };
 
    }

    hashPassword(password: string) {
        return bcrypt.hash(password, 10);
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

    private async createRefreshToken(userId: string): Promise<string> {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        const refreshTokenEntity = this.refreshTokenRepository.create({
            user,
            tokenHash,
            expiresAt,
        })

        await this.refreshTokenRepository.save(refreshTokenEntity)

        return token
    }

    private async createPasswordResetToken(userId: string): Promise<string> {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        const resetPasswordTokenEntity = this.passwordResetTokenRepository.create({
            user,
            tokenHash,
            expiresAt,
        })

        await this.passwordResetTokenRepository.save(resetPasswordTokenEntity)

        return token
    }

    async revokeRefreshToken(token: string): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const refreshTokenEntity = await this.refreshTokenRepository.findOne({
            where: { tokenHash: tokenHash },
        })

        if (refreshTokenEntity) {
            refreshTokenEntity.revoked = true
            await this.refreshTokenRepository.save(refreshTokenEntity)
        }
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


