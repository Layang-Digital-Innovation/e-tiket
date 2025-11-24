import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  ValidationPipe,
  Query,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user, res);
    return ApiResponseDto.success(
      result,
      "Login successful",
      HttpStatus.OK
    )
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @ResponseMessage('User profile retrieved successfully')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookie(res);
    return ApiResponseDto.success(
      null,
      'Logged out successfully',
      HttpStatus.OK
    );
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyEmail(token, res);
  }

  @Post('resend-verification')
  async resendVerificationEmail(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  // Google OAuth routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    const result = await this.authService.login(req.user, res);

    // Get frontend URL from environment variable
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const isProduction = process.env.NODE_ENV === 'production';

    // Dynamic redirect based on Referer/Origin (only in development)
    const allowedOrigins = isProduction
      ? [
        'https://naikkellas.com',
        'https://www.naikkellas.com'
      ]
      : [
        'http://localhost:3000',
        'https://naikkellas.com',
        'https://www.naikkellas.com'
      ];

    const referer = req.headers.referer;
    const origin = req.headers.origin;

    let redirectUrl = frontendUrl; // Default to FRONTEND_URL

    // Check if referer or origin matches allowed domains
    if (referer) {
      const match = allowedOrigins.find(url => referer.startsWith(url));
      if (match) redirectUrl = match;
    } else if (origin) {
      const match = allowedOrigins.find(url => origin === url);
      if (match) redirectUrl = match;
    }

    // Redirect to frontend with token as query parameter for cross-domain compatibility
    res.redirect(`${redirectUrl}/auth/callback?token=${result.accessToken}`);
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async createAdmin(@Body(ValidationPipe) createAdminDto: CreateAdminDto) {
    return this.authService.createAdmin(createAdminDto);
  }


}
