import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userData: Partial<User> = { ...createUserDto };

    if (createUserDto.password) {
      userData.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'profileImage',
        'role',
        'status',
        'createdAt',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'phone',
        'profileImage',
        'role',
        'status',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    await this.usersRepository.update(id, { role });
    return this.findOne(id);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    await this.usersRepository.update(id, { status });
    return this.findOne(id);
  }

  async findByOAuthProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
      },
    });
  }

  async linkOAuthAccount(
    userId: string,
    oauthData: {
      oauthProvider: string;
      oauthProviderId: string;
      profileImage?: string;
      emailVerified?: boolean;
    },
  ): Promise<User | null> {
    await this.usersRepository.update(userId, oauthData);
    await this.usersRepository.save({ id: userId });
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async createFromOAuth(oauthUser: any): Promise<User> {
    const user = this.usersRepository.create({
      email: oauthUser.email,
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      profileImage: oauthUser.profileImage,
      oauthProvider: oauthUser.oauthProvider,
      oauthProviderId: oauthUser.oauthProviderId,
      emailVerified: oauthUser.emailVerified,
      // OAuth users don't have passwords - leave undefined
    });

    return this.usersRepository.save(user);
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async verifyEmail(userId: string): Promise<User | null> {
    await this.usersRepository.update(userId, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  async updateEmailVerificationToken(
    userId: string,
    tokenData: {
      emailVerificationToken: string;
      emailVerificationExpires: Date;
    },
  ): Promise<void> {
    await this.usersRepository.update(userId, tokenData);
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async updatePasswordResetToken(
    userId: string,
    tokenData: { resetPasswordToken: string; resetPasswordExpires: Date },
  ): Promise<void> {
    await this.usersRepository.update(userId, tokenData);
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }



  getTotalUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  getTotalEventOrganizers(): Promise<number> {
    return this.usersRepository.count({
      where: { role: UserRole.EVENT_ORGANIZER }
    });
  }

  getUsersCountBeforeDate(date: Date): Promise<number> {
    return this.usersRepository.count({
      where: {
        createdAt: LessThan(date)
      }
    });
  }

  getEventOrganizersCountAfterDate(date: Date): Promise<number> {
    return this.usersRepository.count({
      where: {
        role: UserRole.EVENT_ORGANIZER,
        createdAt: MoreThanOrEqual(date)
      }
    });
  }

  async findAllUsers(
    page: number = 1,
    limit: number = 10,
    filters: any = {},
  ): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    const query = this.usersRepository.createQueryBuilder('user');

    // Apply filters
    if (filters.role) {
      query.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.status) {
      query.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const users = await query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      users,
      total,
      page,
      limit,
    };
  }
}
