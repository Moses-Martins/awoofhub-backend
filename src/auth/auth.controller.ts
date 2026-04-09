import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { instanceToPlain } from 'class-transformer';
import type { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { EmailDto, LoginUserDto, ResetPasswordDto, VerifyEmailDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('signup')
  @HttpCode(201)
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUser: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(loginUser);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return {
      message: 'Login successful',
      data: {
        ...instanceToPlain(user),
      },
    }
  }

  @Get('google/')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request & { user: any }, @Res() res: Response) {

    const { accessToken, refreshToken } = await this.authService.googleLogin(req.user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(frontendUrl);

  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const { updatedUser, accessToken, refreshToken } = await this.authService.verifyEmail(dto.token);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return updatedUser
  }

  @Post('resend-verification')
  @HttpCode(200)
  resendVerificationMail(@Body() email: EmailDto) {
    return this.authService.resendVerificationMail(email);
  }


  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.signedCookies?.refresh_token;
    if (!token) {
      throw new UnauthorizedException('No refresh token');
    }

    const { accessToken, refreshToken } = await this.authService.refreshToken(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token refreshed' };
  }


  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.signedCookies?.refresh_token;
    if (token) {
      this.authService.revokeRefreshToken(token)
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.online' : undefined,
    });

    return {
      message: 'Logged out successfully'
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() email: EmailDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

}
