import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';
import { EmailService } from '../email/email.service';
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (
      user &&
      (await this.usersService.validatePassword(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, response: Response) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Set secure HTTP-only cookie
    this.setAuthCookie(response, accessToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  private setAuthCookie(response: Response, token: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const cookieMaxAge = this.configService.get<number>('COOKIE_MAX_AGE') || 7 * 24 * 60 * 60 * 1000; // 7 days default

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    });
  }

  clearAuthCookie(response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: this.configService.get('NODE_ENV') === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user with verification token
    const userData = {
      ...registerDto,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false,
    };

    const user = await this.usersService.create(userData);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.firstName,
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    };
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.findOne(userId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      profileImage: user.profileImage,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  async validateOAuthUser(oauthUser: any): Promise<User> {
    // Check if user exists by OAuth provider ID
    let user = await this.usersService.findByOAuthProvider(
      oauthUser.oauthProvider,
      oauthUser.oauthProviderId,
    );

    if (user) {
      return user;
    }

    // Check if user exists by email
    user = await this.usersService.findByEmail(oauthUser.email);

    if (user) {
      // Link OAuth account to existing user and update profile image
      const linkedUser = await this.usersService.linkOAuthAccount(user.id, {
        oauthProvider: oauthUser.oauthProvider,
        oauthProviderId: oauthUser.oauthProviderId,
        profileImage: oauthUser.profileImage,
        emailVerified: oauthUser.emailVerified,
      });
      
      if (!linkedUser) {
        throw new BadRequestException('Failed to link OAuth account');
      }
      
      return linkedUser;
    }

    // Create new user from OAuth data
    return await this.usersService.createFromOAuth(oauthUser);
  }

  async verifyEmail(token: string, response: Response): Promise<{ message: string; user?: Partial<User> }> {
    const user = await this.usersService.findByEmailVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Update user as verified
    const updatedUser = await this.usersService.verifyEmail(user.id);
    
    if (!updatedUser) {
      throw new BadRequestException('Failed to verify email');
    }

    // Send welcome email
    await this.emailService.sendWelcomeEmail(updatedUser.email, updatedUser.firstName);

    // Generate JWT token for auto-login
    const payload: JwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const accessToken = this.jwtService.sign(payload);
    this.setAuthCookie(response, accessToken);

    return {
      message: 'Email verified successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        status: updatedUser.status,
        emailVerified: updatedUser.emailVerified,
      },
    };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.usersService.updateEmailVerificationToken(user.id, {
      emailVerificationToken,
      emailVerificationExpires,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.firstName,
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersService.updatePasswordResetToken(user.id, {
      resetPasswordToken,
      resetPasswordExpires,
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetPasswordToken,
      user.firstName,
    );

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Update password and clear reset token
    await this.usersService.resetPassword(user.id, newPassword);

    return {
      message: 'Password reset successfully',
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<{ message: string; user: Partial<User> }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createAdminDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create admin user data
    const adminData = {
      ...createAdminDto,
      role: UserRole.ADMIN,
      emailVerified: true, // Admin users are pre-verified
    };

    const adminUser = await this.usersService.create(adminData);

    return {
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        status: adminUser.status,
      },
    };
  }
}
