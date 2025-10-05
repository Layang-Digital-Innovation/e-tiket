import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    profileImage : '',
    emailVerified : true,
    emailVerificationToken : '',
    resetPasswordExpires : new Date(),
    resetPasswordToken : ''
  };

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    configService = module.get(ConfigService);
    usersService = module.get(UsersService);
    
    // Mock JWT_SECRET before creating strategy
    configService.get.mockReturnValue('test-jwt-secret');
    
    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error when JWT_SECRET is not defined', () => {
    configService.get.mockReturnValue(undefined);

    expect(() => {
      new JwtStrategy(configService, usersService);
    }).toThrow('JWT_SECRET is not defined in environment variables');
  });

  describe('validate', () => {
    it('should return user data when user exists', async () => {
      const payload: JwtPayload = {
        sub: '1',
        email: 'test@example.com',
        role: 'user',
      };

      usersService.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload: JwtPayload = {
        sub: '999',
        email: 'nonexistent@example.com',
        role: 'user',
      };

      usersService.findOne.mockResolvedValue(null as unknown as User);

      await expect(strategy.validate(payload)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );

      expect(usersService.findOne).toHaveBeenCalledWith('999');
    });
  });
});