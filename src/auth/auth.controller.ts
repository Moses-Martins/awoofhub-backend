import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { instanceToPlain } from 'class-transformer';
import type { Request, Response } from 'express';
import passport from 'passport';
import { UserRole } from 'src/common/types/enums';
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
      sameSite: 'strict',
      signed: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // path: '/auth/refresh',
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return {
      message: 'Login successful',
      data: {
        ...instanceToPlain(user),
      },
    }
  }

  @Get('google/business')
  async googleAuthBusiness(@Req() req, @Res() res) {
    return passport.authenticate('google', {
      state: 'business'
    })(req, res);
  }

  @Get('google/user')
  async googleAuthUser(@Req() req, @Res() res) {
    return passport.authenticate('google', {
      state: 'user'
    })(req, res);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Query('state') state: string, @Req() req: Request & { user: any }, @Res({ passthrough: true }) res: Response) {
    let requestedRole: UserRole = UserRole.USER;

    if (state === UserRole.BUSINESS) {
      requestedRole = UserRole.BUSINESS;
    }

    const { user, accessToken, refreshToken } = await this.authService.googleLogin(req.user, requestedRole);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'strict',
      secure: true,
      sameSite: 'none',
      signed: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // path: '/auth/refresh',
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return {
      data: {
        ...instanceToPlain(user),
      },
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const { updatedUser, accessToken, refreshToken } = await this.authService.verifyEmail(dto.token);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
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
      sameSite: 'strict',
      signed: true,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
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

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

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
