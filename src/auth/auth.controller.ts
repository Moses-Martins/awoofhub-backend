import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import type { Request, Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { EmailDto, LoginUserDto, ResetPasswordDto, VerifyEmailDto } from './dto/login-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created. Verification email sent.' })
  @ApiResponse({ status: 400, description: 'Invalid signup payload', })
  @HttpCode(201)
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and set cookies' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @HttpCode(200)
  async login(@Body() loginUser: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = await this.authService.login(loginUser);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
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
  @ApiOperation({
  summary: 'Initiate Google OAuth login',
})
  async googleAuth(@Req() req) {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
  summary: 'Google OAuth callback endpoint',
})
  async googleAuthRedirect(@Req() req: Request & { user: any }, @Res() res: Response) {

    const { accessToken, refreshToken } = await this.authService.googleLogin(req.user);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(frontendUrl);

  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email using a token' })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Res({ passthrough: true }) res: Response) {
    const { updatedUser, accessToken, refreshToken } = await this.authService.verifyEmail(dto.token);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return updatedUser
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email to user' })
  @HttpCode(200)
  resendVerificationMail(@Body() email: EmailDto) {
    return this.authService.resendVerificationMail(email);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access tokens using the refresh_token cookie' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token missing or invalid',
  })
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
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      signed: true,
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Token refreshed' };
  }


  @Post('logout')
  @ApiOperation({ summary: 'Revoke tokens and clear authentication cookies' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.signedCookies?.refresh_token;
    if (token) {
      this.authService.revokeRefreshToken(token)
    }

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: process.env.NODE_ENV === 'production' ? '.awoofhub.ng' : undefined,
    });

    return {
      message: 'Logged out successfully'
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate password reset flow' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
  })
  async forgotPassword(@Body() email: EmailDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a valid reset token' })
  @ApiResponse({
  status: 200,
  description: 'Password reset successful',
})
@ApiResponse({
  status: 400,
  description: 'Invalid or expired reset token',
})
  async resetPassword(
    @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

}
